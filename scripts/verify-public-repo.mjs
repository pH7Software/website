import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const publicFiles = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  cwd: root,
  encoding: "utf8",
}).split("\0").filter(Boolean);

const sensitivePaths = [
  ["environment file", /(^|\/)\.env(?:\.|$)/i],
  ["package-manager credentials", /(^|\/)\.npmrc$/i],
  ["private key or certificate bundle", /\.(?:pem|key|p12|pfx|jks|keystore)$/i],
  ["credential export", /(^|\/)(?:credentials|service-account)[^/]*\.json$/i],
  ["local secrets directory", /(^|\/)secrets?\//i],
  ["database or data dump", /\.(?:db|sqlite3?|dump|sql)$/i],
  ["WordPress export", /WordPress\..*\.xml$|wordpress-export\.xml$/i],
];

const highConfidencePatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/],
  ["AWS access key", /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["AWS secret access key", /\baws_secret_access_key\b\s*[:=]\s*["']?[A-Za-z0-9/+=]{40}\b/i],
  ["GitHub token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ["Stripe secret key", /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}\b/],
  ["OpenAI API key", /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ["Slack token", /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/],
  ["Google API key", /\bAIza[0-9A-Za-z_-]{35}\b/],
  ["SendGrid API key", /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{20,}\b/],
  ["npm token", /\bnpm_[A-Za-z0-9]{30,}\b/],
  ["JSON Web Token", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ["URL with embedded credentials", /\b(?:https?|postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s/:@]+:[^\s/@]+@/i],
];

const textOnlyPatterns = [
  ["literal secret assignment", /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret|private[_-]?key)\b\s*[:=]\s*["'`](?!\$\{|<|your|example|placeholder|process\.env|import\.meta\.env)[^"'`\s]{8,}["'`]/i],
  ["removed personal-name fragment", /\b(?:Sanz|González|Gonzalez|Béghin|Beghin|Rollier)\b/i],
];

const findings = [];
for (const file of publicFiles) {
  for (const [category, pattern] of sensitivePaths) {
    const isReviewedSchemaMigration = category === "database or data dump"
      && /^marketplace-worker\/migrations\/\d{4}_[a-z0-9_]+\.sql$/.test(file);
    if (file !== ".env.example" && !isReviewedSchemaMigration && pattern.test(file)) {
      findings.push({ file, category });
    }
  }
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) continue;
  const buffer = fs.readFileSync(absolute);
  const isBinary = buffer.subarray(0, 8192).includes(0);
  const content = buffer.toString("utf8");
  const patterns = isBinary ? highConfidencePatterns : [...highConfidencePatterns, ...textOnlyPatterns];
  for (const [category, pattern] of patterns) {
    if (file === "scripts/verify-public-repo.mjs" && category === "removed personal-name fragment") continue;
    if (pattern.test(content)) findings.push({ file, category });
  }
}

const unique = [...new Map(findings.map((finding) => [`${finding.file}:${finding.category}`, finding])).values()];
if (unique.length > 0) {
  console.error("Public-repository safety check failed:");
  for (const finding of unique) console.error(`- ${finding.file}: ${finding.category}`);
  process.exit(1);
}

console.log(`Public-repository safety check passed (${publicFiles.length} files scanned).`);
