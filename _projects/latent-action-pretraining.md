---
title: "Latent Action Pre-training"
collection: projects
permalink: /projects/latent-action-pretraining/
order: 1
status: "Ongoing"
excerpt: "Learning a compact latent action space from unlabeled human and robot video, so that downstream manipulation policies need far fewer teleoperated demonstrations."
tags: ["Latent Action", "Pre-training", "Manipulation"]
# 首页卡片的动图：poster 是静态首帧，鼠标悬停时自动切换到 gif 播放。
# 只填 gif 也可以（会一直循环播放）；也可以用 video: /images/projects/xxx.mp4 代替 gif。
poster: /images/projects/latent-action.png
gif: /images/projects/latent-action.gif
links:
  - name: Code
    url: https://github.com/axzoro1999
    icon: fab fa-github
  - name: Paper
    url: /files/paper1.pdf
    icon: fas fa-file-pdf
---

Replace this text with the story of the project: the problem, what you built, and
what the demo above is showing. Everything in this file is optional except the
front matter, and the front matter drives the card on the front page.

## Highlights

- Trains on unlabeled egocentric video, no action labels required.
- Transfers to a real robot with a fraction of the usual demonstration budget.
- Latent actions stay interpretable enough to be composed at inference time.
