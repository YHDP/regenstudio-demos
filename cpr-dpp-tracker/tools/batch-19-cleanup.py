#!/usr/bin/env python3
"""
Batch 19/19: Cleanup — mark all processed issues as resolved/acknowledged
in review-queue-merged.json.

Rules:
  - dataUpdates: all 9 → status: "resolved"
  - structuralIssues with "monitor" in action → status: "acknowledged"
  - All other structuralIssues → status: "resolved"
"""

import json, os

QUEUE_PATH = os.path.join(os.path.dirname(__file__), '..', 'deep-dives', 'review-queue-merged.json')

def main():
    with open(QUEUE_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    resolved_count = 0
    acknowledged_count = 0

    # Mark all dataUpdates as resolved
    for item in data['dataUpdates']:
        if item.get('status') != 'resolved':
            item['status'] = 'resolved'
            resolved_count += 1

    # Mark structuralIssues
    for item in data['structuralIssues']:
        action = item.get('action', '').lower()
        if 'monitor' in action and ('no data change' in action or 'flag' in action or 'cross-reference' in action or 'verify' in action):
            if item.get('status') != 'acknowledged':
                item['status'] = 'acknowledged'
                acknowledged_count += 1
        else:
            if item.get('status') != 'resolved':
                item['status'] = 'resolved'
                resolved_count += 1

    # Update regenerated timestamp
    data['regenerated'] = '2026-03-02T00:00:00Z'
    data['note'] = (
        'All 9 dataUpdates and 224 structuralIssues processed in batches 1-18. '
        'Batch 19 marks all issues as resolved or acknowledged.'
    )

    # Write back
    with open(QUEUE_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    # Validate
    with open(QUEUE_PATH, 'r', encoding='utf-8') as f:
        v = json.load(f)

    pending_du = sum(1 for i in v['dataUpdates'] if i.get('status') == 'pending')
    pending_si = sum(1 for i in v['structuralIssues'] if i.get('status', 'pending') == 'pending')
    no_status = sum(1 for i in v['structuralIssues'] if 'status' not in i)
    ack_count = sum(1 for i in v['structuralIssues'] if i.get('status') == 'acknowledged')
    res_du = sum(1 for i in v['dataUpdates'] if i.get('status') == 'resolved')
    res_si = sum(1 for i in v['structuralIssues'] if i.get('status') == 'resolved')

    print(f'  dataUpdates: {res_du}/9 resolved')
    print(f'  structuralIssues: {res_si} resolved, {ack_count} acknowledged')
    print(f'  Remaining pending: {pending_du} dataUpdates, {pending_si} structuralIssues')
    print(f'  No status field: {no_status}')

    assert pending_du == 0, f'{pending_du} dataUpdates still pending'
    assert pending_si == 0, f'{pending_si} structuralIssues still pending'
    assert no_status == 0, f'{no_status} structuralIssues have no status'

    print(f'\nBatch 19 complete: {resolved_count} newly resolved, {acknowledged_count} newly acknowledged')
    print(f'Total: {res_du + res_si} resolved + {ack_count} acknowledged = {res_du + res_si + ack_count} items')

if __name__ == '__main__':
    main()
