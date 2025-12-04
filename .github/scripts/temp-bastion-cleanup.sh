#!/bin/bash
set -u

BASTION_ID="${1:-}"

if [[ -z "$BASTION_ID" ]]; then
  echo "No instance ID provided; skipping termination."
  exit 0
fi

if ! [[ "$BASTION_ID" =~ ^i-[a-f0-9]{8,17}$ ]]; then
  echo "Instance ID '$BASTION_ID' appears invalid; skipping."
  exit 0
fi

term_out="$(aws ec2 terminate-instances \
  --instance-ids "$BASTION_ID" \
  --query 'TerminatingInstances[0].[PreviousState.Name,CurrentState.Name]' \
  --output text 2>&1)"
if [[ $? -ne 0 ]]; then
  echo "Terminate request failed for $BASTION_ID: $term_out"
  exit 0
fi

prev_state="$(awk '{print $1}' <<<"$term_out")"
curr_state="$(awk '{print $2}' <<<"$term_out")"
echo "Termination requested for $BASTION_ID (prev=$prev_state, current=$curr_state)"

exit 0