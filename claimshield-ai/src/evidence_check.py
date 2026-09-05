def check_completeness(claim, required_docs):
    documents = claim.get("documents", {})

    present_docs = []
    missing_docs = []

    for doc in required_docs:
        document = documents.get(doc, {})
        if document.get("present") is True:
            present_docs.append(doc)
        else:
            missing_docs.append(doc)

    total_required = len(required_docs)
    present_count = len(present_docs)

    if total_required == 0:
        completeness_pct = 100
    else:
        completeness_pct = round((present_count / total_required) * 100)

    return {
        "isComplete": len(missing_docs) == 0,
        "completenessPct": completeness_pct,
        "requiredDocuments": required_docs,
        "presentDocuments": present_docs,
        "missingDocuments": missing_docs,
    }
