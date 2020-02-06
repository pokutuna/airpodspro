# !! SET YOUR PROJECT ID !!
PROJECT := pokutuna-playground

GCLOUD := gcloud --project $(PROJECT)
TOPIC := check-stock-apple-store

.PHONY: build
build:
	yarn compile

.PHONY: deploy
deploy: build
	$(GCLOUD) functions deploy airpodspro \
		--entry-point=check \
		--runtime=nodejs10 \
		--trigger-topic=$(TOPIC) \
		--region=asia-northeast1

.PHONY: create-topic
create-topic:
	$(GCLOUD) pubsub topics create $(TOPIC)


# AirPods Pro
ITEM := MWP22J/A
# Apple 京都
STORE := R711

SLACK_WEBHOOK := https://hooks.slack.com/services/**************
SLACK_CHANNEL := \#times_pokutuna

.PHONY: publish-message-example
publish-message-example:
	$(GCLOUD) pubsub topics publish $(TOPIC) \
		--message='{ "item": "$(ITEM)", "store": "$(STORE)", "notify_not_today": true, "slack": { "webhook": "$(SLACK_WEBHOOK)", "channel": "$(SLACK_CHANNEL)" } }'

.PHONY: create-scheduler-example
create-scheduler-example:
	$(GCLOUD) scheduler jobs create pubsub kick-airpodspro-pokutuna \
		--topic=$(TOPIC) \
		--schedule="every 10 minutes" \
		--message-body='{ "item": "$(ITEM)", "store": "$(STORE)", "notify_not_today": false, "slack": { "webhook": "$(SLACK_WEBHOOK)", "channel": "$(SLACK_CHANNEL)" } }'
