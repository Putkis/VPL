# Cloud Scheduler -> Cloud Run Job

Use this after deploying the Cloud Run Job (`vpl-score-job`).

## 1) Create service account for scheduler invocations

```bash
gcloud iam service-accounts create vpl-scheduler-invoker
```

## 2) Allow scheduler account to run the job

```bash
gcloud run jobs add-iam-policy-binding vpl-score-job \
  --region=europe-north1 \
  --member="serviceAccount:vpl-scheduler-invoker@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

## 3) Create HTTP scheduler trigger

```bash
gcloud scheduler jobs create http vpl-score-weekly \
  --location=europe-north1 \
  --schedule="5 22 * * 0" \
  --uri="https://europe-north1-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${PROJECT_ID}/jobs/vpl-score-job:run" \
  --http-method=POST \
  --oauth-service-account-email="vpl-scheduler-invoker@${PROJECT_ID}.iam.gserviceaccount.com"
```

## 4) Run once manually (smoke test)

```bash
gcloud run jobs execute vpl-score-job --region=europe-north1
```

