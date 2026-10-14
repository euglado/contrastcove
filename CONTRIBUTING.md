# Katkı / Contributing

Hataları token, .env, kullanıcı kimliği veya özel sunucu içeriği olmadan bildirin.
Node sürümü, işletim sistemi, sentetik renk örneği ve beklenen/gerçek davranış yeterlidir.
Güvenlik açığını herkese açık issue içinde paylaşmayın; SECURITY.md dosyasını izleyin.

Report bugs with OS, Node version, synthetic colors and expected/actual behavior.
Never attach credentials, .env, personal IDs or private server content.
Use SECURITY.md for vulnerabilities.

## Development

Use Node 24 and run:

```text
npm ci --ignore-scripts
npm run check
npm audit --audit-level=low
```

Keep changes focused. Test meaningful calculation and interaction edge cases.
Preserve explicit publication, least permissions, bounded RAM, sanitized logs and bilingual guidance.
Dependency updates require lockfile changes and license/source/integrity review.
Do not add telemetry, message-content intents or automatic publishing.
Use your own dedicated test application/server for live validation; no production token in tests or CI.
Contribution licensing follows the repository's MIT license.
