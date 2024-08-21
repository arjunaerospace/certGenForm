// Helper function to import a public key from PEM format
async function importPublicKey(publicKeyPem) {
  const keyBuffer = pemToBuffer(publicKeyPem);
  return await crypto.subtle.importKey(
    "spki",
    keyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );
}

// Helper function to convert PEM to ArrayBuffer
function pemToBuffer(pem) {
  const pemHeader = "-----BEGIN PUBLIC KEY-----";
  const pemFooter = "-----END PUBLIC KEY-----";
  const base64 = pem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

async function encrypt(plainText, publicKeyPem) {
  const publicKey = await importPublicKey(publicKeyPem);
  const encodedText = new TextEncoder().encode(plainText);
  const encryptedData = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encodedText
  );
  return new Uint8Array(encryptedData);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  alert("Copied to clipboard");
}

function goToCertificate(link) {
  window.open(link);
}

async function generateLink(
  version,
  certificateType,
  certificateStyle,
  name,
  activityStartDate,
  activityEndDate
  // activityName,
  // key,
  // additionalComment
) {
  if (name == "" || activityStartDate == "" || activityEndDate == "") {
    return "<p>Error: Missing or incorrect parameters</p>";
  }

  content = `v:${version},t:${certificateType},c:${certificateStyle},n:${name},s:${activityStartDate},e:${activityEndDate}`;
  const url = "https://arjunaerospace.github.io/certView/";
  let link = `${url}?m=`;

  const plainText = content; // 190 characters limit
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3TSRRg+t2QHxjgmkPmZX
  AKJEgoMUHGknT/u5Rd4OKD5rPa82+O6AI4NU1rruDFHOiahQEwZnm2klxGttVolu
  WXeJVUlJXVU2axEANFtOAk7HgxslpLKVVgYLQnbBGlj731Rpct2CdNekBMGciWm4
  BI2aC36GpLQShtpFlq/Sx/QvFcddacYhm6zTnQSZh25ambGOgmdL8BJvo+h2ndAC
  EWcCwjIJmVULh0jFkwGIihcWQcwKZ5ZEC/d/6OlOUz6pGRbTxHF4tz0ey9n/PdBk
  +nH81Ziw2y+wguWBVdNjcM+BcFG6wIDVyYYMJtbz80l82jOfGN13hPcAj6jenvUm
  AQIDAQAB
  -----END PUBLIC KEY-----`;

  const passphrase = "qwerty"; // Your passphrase here

  const encryptedData = await encrypt(plainText, publicKeyPem, passphrase);
  console.log(link);
  link += btoa(String.fromCharCode(...encryptedData));
  console.log("Encrypted Text (Base64):", link);
  console.log(typeof link);

  return `
  <a href="${link}" target="_blank">Certificate Link</a>
  <br><br>
  <button onclick="copyToClipboard('${link}')">Copy Certificate Link</button>
  <button onclick="goToCertificate('${link}')">Go To Your Certificate</button>
  `;
}
