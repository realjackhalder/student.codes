#!/usr/bin/env python3
"""Track the sequential product issues for the local student.codes roadmap.

This tool deliberately tracks work instead of attempting to generate code. Each
issue is implemented and verified by the engineering workflow before the next
one is started.
"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


ISSUES = (
    "Personal Code Library",
    "Shareable Playground Links",
    "Daily Coding Challenges",
    "Real-world Starter Templates",
    "Explain Errors and Output",
    "Browser Extension: Run and Save",
    "Learning Mode",
    "Personal Automations / Mini Tools",
    "Collaboration Rooms",
)
STATE_FILE = Path(__file__).with_name(".issue-runner-state.json")


def default_state() -> dict[str, object]:
    return {"version": 1, "issues": {str(index): "pending" for index in range(1, 10)}}


def read_state() -> dict[str, object]:
    if not STATE_FILE.exists():
        return default_state()
    return json.loads(STATE_FILE.read_text())


def write_state(state: dict[str, object]) -> None:
    STATE_FILE.write_text(json.dumps(state, indent=2) + "\n")


def status(state: dict[str, object]) -> None:
    issues = state["issues"]
    for index, title in enumerate(ISSUES, start=1):
        print(f"{index}. [{issues[str(index)]}] {title}")


def command_start(state: dict[str, object], issue: int) -> None:
    issues = state["issues"]
    for previous in range(1, issue):
        if issues[str(previous)] != "complete":
            raise SystemExit(f"Issue {previous} must be complete before starting issue {issue}.")
    if issues[str(issue)] == "complete":
        raise SystemExit(f"Issue {issue} is already complete.")
    for other in range(1, 10):
        if other != issue and issues[str(other)] == "in_progress":
            raise SystemExit(f"Issue {other} is already in progress.")
    issues[str(issue)] = "in_progress"
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    write_state(state)
    print(f"Started issue {issue}: {ISSUES[issue - 1]}")


def command_complete(state: dict[str, object], issue: int) -> None:
    issues = state["issues"]
    if issues[str(issue)] != "in_progress":
        raise SystemExit(f"Issue {issue} must be in progress before completion.")
    issues[str(issue)] = "complete"
    state["updated_at"] = datetime.now(timezone.utc).isoformat()
    write_state(state)
    print(f"Completed issue {issue}: {ISSUES[issue - 1]}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("status")
    for name in ("start", "complete"):
        subparser = subparsers.add_parser(name)
        subparser.add_argument("issue", type=int, choices=range(1, 10))
    args = parser.parse_args()
    state = read_state()
    if args.command == "status":
        status(state)
    elif args.command == "start":
        command_start(state, args.issue)
    else:
        command_complete(state, args.issue)


if __name__ == "__main__":
    main()
