"""REM's memory layer — every cognee call lives here.

The four lifecycle operations map to REM concepts:
  remember() -> experiences: chat turns stored as QAEntry, notes as text
  recall()   -> context retrieval before every reply (feedback-weighted)
  improve()  -> Sleep: consolidation; bridges session memory into the graph
  forget()   -> surgical deletion of a dataset, or everything

Feedback is native: FeedbackEntry chained to a QAEntry's id, then
recall(feedback_influence=...) re-weights retrieval — memory that
gets sharper the more it's corrected.
"""

from typing import Any

import cognee

DATASET = "main_dataset"
FEEDBACK_INFLUENCE = 0.4


def _entry_text(entry: Any) -> str:
    for attr in ("text", "answer", "content", "context"):
        val = getattr(entry, attr, None)
        if isinstance(val, str) and val.strip():
            return val
    if hasattr(entry, "model_dump"):
        return str(entry.model_dump())
    return str(entry)


async def remember_qa(question: str, answer: str, session_id: str) -> str | None:
    """Store a chat turn as a QA entry; returns the entry id for feedback chaining."""
    result = await cognee.remember(
        cognee.QAEntry(question=question, answer=answer),
        session_id=session_id,
        run_in_background=True,
    )
    info = result.to_dict() if hasattr(result, "to_dict") else {}
    for key in ("entry_id", "qa_id", "id"):
        if info.get(key):
            return str(info[key])
    return None


async def remember_text(text: str) -> None:
    await cognee.remember(text)


async def recall_context(query: str, session_id: str | None = None) -> list[str]:
    results = await cognee.recall(
        query_text=query,
        session_id=session_id,
        only_context=True,
        top_k=8,
        feedback_influence=FEEDBACK_INFLUENCE,
    )
    return [_entry_text(r) for r in results or []]


async def give_feedback(
    qa_id: str, score: int, text: str | None = None, session_id: str = "default"
) -> None:
    await cognee.remember(
        cognee.FeedbackEntry(qa_id=qa_id, feedback_score=score, feedback_text=text),
        session_id=session_id,
    )


async def sleep(session_ids: list[str] | None = None) -> dict:
    """REM's sleep cycle: memify — prune stale nodes, strengthen frequent
    connections, and bridge session memory into the permanent graph. If
    Cognee Cloud is configured, the consolidated brain is then archived
    there — dreams are processed locally, lasting memories are backed up."""
    import os

    result = await cognee.improve(DATASET, session_ids=session_ids)
    archived = False
    if os.getenv("COGNEE_SERVICE_URL") and os.getenv("COGNEE_API_KEY"):
        try:
            # re-derive: upload raw content and let Cloud's own cognify
            # pipeline rebuild the graph remotely (preserve-mode COGX import
            # 409s against the current Cloud version)
            push_result = await cognee.push(
                DATASET, mode="re-derive", run_in_background=True
            )
            archived = True
            logger_detail = str(push_result)[:500]
        except Exception as e:  # archive is best-effort; sleep still succeeded
            logger_detail = f"cloud archive failed: {e}"
        print(f"[sleep] cloud archive: {logger_detail}")
    return {"status": "slept", "archived": archived, "detail": str(result)[:2000]}


async def forget_everything() -> dict:
    return await cognee.forget(everything=True)


async def forget_dataset(dataset: str) -> dict:
    return await cognee.forget(dataset=dataset)


async def export_graph() -> dict:
    """Return {nodes, links} for the frontend force-graph, straight from
    cognee's graph engine (NetworkX/Kuzu locally).

    Multi-tenant mode keys each user+dataset to its own graph database, so
    resolve the default user's dataset and set the database context first —
    the same dance cognee.visualize_graph does."""
    from cognee.context_global_variables import set_database_global_context_variables
    from cognee.infrastructure.databases.graph import get_graph_engine
    from cognee.modules.data.methods import get_authorized_existing_datasets
    from cognee.modules.users.methods import get_default_user

    user = await get_default_user()
    datasets = await get_authorized_existing_datasets([DATASET], "read", user)
    if not datasets:
        return {"nodes": [], "links": []}

    async with set_database_global_context_variables(
        datasets[0].id, datasets[0].owner_id
    ):
        engine = await get_graph_engine()
        nodes_raw, edges_raw = await engine.get_graph_data()

    nodes = []
    for node_id, props in nodes_raw:
        props = props or {}
        nodes.append(
            {
                "id": str(node_id),
                "label": str(props.get("name") or props.get("text") or node_id)[:80],
                "type": str(props.get("type") or props.get("entity_type") or "node"),
            }
        )
    links = []
    for edge in edges_raw:
        src, dst, rel = edge[0], edge[1], edge[2] if len(edge) > 2 else ""
        links.append({"source": str(src), "target": str(dst), "label": str(rel)})
    return {"nodes": nodes, "links": links}
