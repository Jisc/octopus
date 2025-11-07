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

state_out="$(aws ec2 describe-instances \
  --instance-ids "$BASTION_ID" \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text 2>&1)"
if [[ $? -ne 0 ]]; then
  echo "Describe failed for $BASTION_ID: $state_out"
  exit 0
fi
echo "Current state for $BASTION_ID: $state_out"

prot_out="$(aws ec2 describe-instance-attribute \
  --instance-id "$BASTION_ID" \
  --attribute disableApiTermination \
  --query 'DisableApiTermination.Value' \
  --output text 2>&1)"
if [[ $? -ne 0 ]]; then
  echo "Could not read DisableApiTermination for $BASTION_ID: $prot_out"
else
  echo "DisableApiTermination: $prot_out"
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