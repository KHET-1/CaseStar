from neo4j import GraphDatabase
import os
import logging

logger = logging.getLogger(__name__)


class GraphService:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver = None

    def connect(self):
        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password)
            )
            self.driver.verify_connectivity()
            logger.info("Connected to Neo4j Graph Database")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            self.driver = None

    def close(self):
        if self.driver:
            self.driver.close()

    def create_case(self, case_id: str, title: str):
        if not self.driver:
            return

        query = """
        MERGE (c:Case {id: $case_id})
        SET c.title = $title, c.created_at = datetime()
        RETURN c
        """
        try:
            with self.driver.session() as session:
                session.run(query, case_id=case_id, title=title)
        except Exception as e:
            logger.error(f"Error creating case in graph: {e}")

    def add_document(
        self, case_id: str, doc_id: str, filename: str, summary: str
    ):
        if not self.driver:
            return

        query = """
        MATCH (c:Case {id: $case_id})
        MERGE (d:Document {id: $doc_id})
        SET d.filename = $filename,
            d.summary = $summary,
            d.created_at = datetime()
        MERGE (c)-[:CONTAINS]->(d)
        """
        try:
            with self.driver.session() as session:
                session.run(
                    query,
                    case_id=case_id,
                    doc_id=doc_id,
                    filename=filename,
                    summary=summary
                )
        except Exception as e:
            logger.error(f"Error adding document to graph: {e}")

    def add_entity(self, doc_id: str, name: str, entity_type: str):
        if not self.driver:
            return

        query = """
        MATCH (d:Document {id: $doc_id})
        MERGE (e:Entity {name: $name})
        SET e.type = $entity_type
        MERGE (d)-[:MENTIONS]->(e)
        """
        try:
            with self.driver.session() as session:
                session.run(
                    query,
                    doc_id=doc_id,
                    name=name,
                    entity_type=entity_type
                )
        except Exception as e:
            logger.error(f"Error adding entity to graph: {e}")

    def get_all_cases(self):
        """Fetch all cases from the graph database"""
        if not self.driver:
            return []

        query = """
        MATCH (c:Case)
        RETURN c.id as id,
               c.title as title,
               toString(c.created_at) as created_at
        ORDER BY c.created_at DESC
        """
        try:
            with self.driver.session() as session:
                result = session.run(query)
                return [dict(record) for record in result]
        except Exception as e:
            logger.error(f"Error fetching cases from graph: {e}")
            return []


# Global instance
graph_service = GraphService()
