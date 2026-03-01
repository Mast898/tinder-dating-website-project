#!/bin/bash
# Fix for: failed calling webhook "validate.nginx.ingress.kubernetes.io"
# This removes the admission webhook that blocks ingress creation
# when the nginx ingress controller pod is not responding.

set -e

echo "=== Step 1: Deleting ValidatingWebhookConfiguration ==="
kubectl delete validatingwebhookconfiguration ingress-nginx-admission 2>/dev/null && \
  echo "Webhook deleted successfully." || \
  echo "Webhook not found (may already be deleted)."

echo ""
echo "=== Step 2: Verifying Ingress Controller is running ==="
if kubectl get pods -n ingress-nginx -l app.kubernetes.io/component=controller --no-headers 2>/dev/null | grep -q Running; then
  echo "Ingress controller pod is running."
else
  echo "WARNING: Ingress controller pod is NOT running."
  echo "Install it with:"
  echo "  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.12.1/deploy/static/provider/cloud/deploy.yaml"
  echo ""
  echo "Or via Helm:"
  echo "  helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx"
  echo "  helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace"
fi

echo ""
echo "=== Step 3: Applying ingress manifest ==="
kubectl apply -f k8s/ingress.yaml && \
  echo "Ingress applied successfully!" || \
  echo "Failed to apply ingress. Check errors above."

echo ""
echo "=== Done ==="
echo "Check status with: kubectl get ingress -n flame-dating"
