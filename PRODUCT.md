# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

This site serves visitors exploring Dennis J. Carroll's technical projects and creative writing. For Edge AI Training Lab, the primary audience is learners who want to understand neural network training.

## Product Purpose

dennisjcarroll.com is a personal technical portfolio and writing site. Edge AI Training Lab lets learners configure and run small neural network experiments in the browser. Its first screen should help them understand training.

## Positioning

The lab combines editable datasets, model architecture, and training settings with a live network view, decision boundary, progress metrics, and loss and accuracy curves in one browser-based experiment.

## Operating Context

Learners choose a dataset, adjust hidden layers and training settings, run training, and inspect changes. They can compare two model configurations and export a trained model. The page is a standalone static HTML app linked from the site's Gatsby app catalog.

## Capabilities and Constraints

- Preserve existing training, comparison, visualization, stopping, and export behavior.
- Keep all computation in the browser through TensorFlow.js.
- Keep the app usable on mobile and with keyboard controls.
- Do not introduce fabricated performance or learning-outcome claims.

## Evidence on Hand

- `static/apps/edge-ai-sandbox.html` contains the current interface and training implementation.
- `src/pages/apps.js` describes and links to the app in the public catalog.
- No user research or measured learning outcomes are available in this repository.

## Product Principles

- Make training state and feedback legible before asking learners to tune many settings.
- Show cause and effect between configuration, model structure, and results.
- Keep controls and representations truthful to the calculations they drive.
