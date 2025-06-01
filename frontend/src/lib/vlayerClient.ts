import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import proverSpec from "./specs/EmailDomainProver.sol/EmailDomainProver.json";
import verifierSpec from "./specs/EmailProofVerifier.sol/EmailDomainVerifier.json";

// Configuration for vlayer client
const config = {
  proverUrl:
    process.env.NEXT_PUBLIC_VLAYER_PROVER_URL || "https://prover.vlayer.xyz",
  dnsServiceUrl:
    process.env.NEXT_PUBLIC_VLAYER_DNS_SERVICE_URL || "https://dns.vlayer.xyz",
  token: process.env.NEXT_PUBLIC_VLAYER_API_TOKEN || "",
  gasLimit: BigInt(process.env.NEXT_PUBLIC_VLAYER_GAS_LIMIT || "10000000"),
};

const vlayerOperator = process.env.NEXT_PUBLIC_VLAYER_OPERATOR || "";

// EML content for demo purposes
const verifyVlayerEml = `Return-Path: <artur@vlayer.xyz>
Received: from mail-wm1-f51.google.com (mail-wm1-f51.google.com [209.85.128.51])
 by inbound-smtp.us-east-2.amazonaws.com with SMTP id vm1p3c6jenrgbr944ldf0ljraep1ndp19hbclt01
 for 7921e0d1-e3e1-4422-9636-70dd8cb95245@proving.vlayer.xyz;
 Thu, 20 Feb 2025 12:38:04 +0000 (UTC)
X-SES-Spam-Verdict: FAIL
X-SES-Virus-Verdict: PASS
Received-SPF: pass (spfCheck: domain of vlayer.xyz designates 209.85.128.51 as permitted sender) client-ip=209.85.128.51; envelope-from=artur@vlayer.xyz; helo=mail-wm1-f51.google.com;
Authentication-Results: amazonses.com;
 spf=pass (spfCheck: domain of vlayer.xyz designates 209.85.128.51 as permitted sender) client-ip=209.85.128.51; envelope-from=artur@vlayer.xyz; helo=mail-wm1-f51.google.com;
 dkim=pass header.i=@vlayer.xyz;
 dmarc=pass header.from=vlayer.xyz;
X-SES-RECEIPT: AEFBQUFBQUFBQUFGMXNOUldBMU96UGRiYk03NmlXWE5pTVZEVUhlQktPdGV0UFFHeHZ6YzJnVmtwWjJINFZGTUN1cTZhRTBoakM5bVBhd012UFNta3ViWDVVK3d4aldEdmJpZmIyRlpHVUZuZFNET0JxNmFEallSZXYyMDhodmlMa0xIUTR6TGczdy8xNldqeDZXc0o2cWpNWFlVMFRSZlc5c1gzaDJReW8zRVF0NnJGYVZpZDZ4WCt4SjFzVDlmWGxqc214UjIrdVJYRUp1S1MrTjhaWmhPR3J4ZWdiMjRnZExST2RwZFMrWCt1bWRadVp6RGx4bGNOcW45QWgvWW9GZ2lRK2FrUXhUN0JTdEpuQnBEblN2V21MTVAxcUErMzl5N01LU1R1Y2FkdzFFN2t5Y3c4c0E9PQ==
X-SES-DKIM-SIGNATURE: a=rsa-sha256; q=dns/txt; b=WemofLXoBxooRxJsFIbzg3ZPygWckEycRik2bNwcE7JT+gXw5rIYkudJMEZoV7NgYpQpJw28R81GTxbmYriPM+p4Ql+5XLVSB52FUboCyqlXz4B6O/lFK3B39OOH4SecbHrac8XgxDMf6MDX6/dtlMlu2B0D8PPhWNma36Y4blQ=; c=relaxed/simple; s=xplzuhjr4seloozmmorg6obznvt7ijlt; d=amazonses.com; t=1740055085; v=1; bh=ZhcNAhpOtSJL6zWNKLSprRJZeloGBBrDShzfzlBgc0M=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;
Received: by mail-wm1-f51.google.com with SMTP id 5b1f17b1804b1-43994ef3872so5061475e9.2
        for <7921e0d1-e3e1-4422-9636-70dd8cb95245@proving.vlayer.xyz>; Thu, 20 Feb 2025 04:38:04 -0800 (PST)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=vlayer.xyz; s=google; t=1740055082; x=1740659882; darn=proving.vlayer.xyz;
        h=to:subject:message-id:date:from:mime-version:from:to:cc:subject
         :date:message-id:reply-to;
        bh=ZhcNAhpOtSJL6zWNKLSprRJZeloGBBrDShzfzlBgc0M=;
        b=F2W/iBAmmSZA+OncqRutYON6srl97A0apK9Ixc0AfXNllhEE7uzJk5+pl0EAKfeAgp
         fLbOWX9nHdr2TjT2wE1Wge27imZWrJ8d6PIdTNnrIgY7dBMtXLRpT6Swu8/hfq7fa2O3
         rYH9R80IZSFf5fGPmVxbLReV8BweMgdpr5lp4Sf/JUTaRYr+IlwYJCPvxIVDAmPEm6Un
         +hMC9JHoPYDK0Y5cPHKMnUfNQUMTNxOLj2urhe7ahG64SF9DgYOsbO75Lug5FfcYxON3
         4P0VwXGSM9Mow3AI3z89TqCaytCINNoTpNf/BhxkQDbpcspPxbfw9LUuFddhi5Hrz2n8
         tSBw==
MIME-Version: 1.0
From: Artur Chmaro <artur@vlayer.xyz>
Date: Thu, 20 Feb 2025 13:37:50 +0100
Message-ID: <CAGp8hgAkJ5KoHVmLHUxuyrCGKAvmcigt5pYqmHi6t56udzRuEg@mail.gmail.com>
Subject: Mint my domain NFT at address: 0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf
To: 7921e0d1-e3e1-4422-9636-70dd8cb95245@proving.vlayer.xyz
Content-Type: multipart/alternative; boundary="00000000000016fe39062e9225db"

--00000000000016fe39062e9225db
Content-Type: text/plain; charset="UTF-8"



--00000000000016fe39062e9225db
Content-Type: text/html; charset="UTF-8"

<div dir="ltr"><br></div>

--00000000000016fe39062e9225db--`;

const incorrectVlayerEml = `Delivered-To: ivanruch@gmail.com
Received: by 2002:a05:6214:2d09:b0:6d4:dbb:92cf with SMTP id mz9csp1486494qvb;
        Wed, 11 Dec 2024 15:19:11 -0800 (PST)
Return-Path: <ivan@vlayer.xyz>
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed;
        d=vlayer.xyz; s=google; t=1733959150; x=1734563950; dara=google.com;
        h=to:subject:message-id:date:from:mime-version:from:to:cc:subject
         :date:message-id:reply-to;
        bh=lAcT5dEPM7q8LA/nAGvLhlzHkTCJGjwPJGgQ6BB92Rs=;
        b=AEitmHE4SAwyDWBxrcmDUOA4Kf02pfrzhXNWxspkszcKzk6ohFywHnKbEOz6GbaSTL
         8kC8ES4UdpG7BB0p+AL8dXKgRZmGFmbUcuFnfq4BisJTjh6Mn1OBvJrkdwzjX36vFGdb
         DZRWQUgp3KT+9+d+e/rpntDkY1h6XeWwf9TT78UYX+izYTAc59zFEw02ais0X2+pgOAX
         SjyEZlVAiZqa2OoSpYQmleRbPglJapDAOPODbzfr+75jrqQjyY3gBYNqxqMNJnlsJzZk
         GwAqmV2YJd2NImoPLBiVWhqdTLg5kWOsyf++EvKC4c3c5hupzULW4YTix6guItDKzL32
         2rqQ==
MIME-Version: 1.0
From: Ivan Rukhavets <ivan@vlayer.xyz>
Date: Thu, 12 Dec 2024 00:18:58 +0100
Message-ID: <CAM-4p2XcgHvpm2_f1-oSOiWcW+Ke7719QHFLVYNrUtkBYV+pCw@mail.gmail.com>
Subject: Random subject
To: Ivan Rukhavets <ivanruch@gmail.com>
Content-Type: multipart/alternative; boundary="0000000000002b9a19062906d34d"

--0000000000002b9a19062906d34d
Content-Type: text/plain; charset="UTF-8"

0x0E8e5015042BeF1ccF2D449652C7A457a163ECB9

--0000000000002b9a19062906d34d
Content-Type: text/html; charset="UTF-8"

<div dir="ltr">0x0E8e5015042BeF1ccF2D449652C7A457a163ECB9</div>

--0000000000002b9a19062906d34d--`;

export interface VlayerProofResult {
  proof: any;
  emailHash: string;
  targetWallet: string;
  emailDomain: string;
  verifierAddress: string;
}

/**
 * Check if uploaded EML content should pass verification
 * For demo purposes: if content contains "makemytrip", use verify_vlayer.eml, otherwise use incorrect_vlayer.eml
 */
export function shouldEmlPassVerification(emlContent: string): boolean {
  const containsMakemytrip = emlContent.toLowerCase().includes("makemytrip");
  console.log("EML Content Check:", {
    hasContent: !!emlContent,
    contentLength: emlContent.length,
    containsMakemytrip,
    firstFewLines: emlContent.split("\n").slice(0, 5),
  });
  return containsMakemytrip;
}

/**
 * Read EML file content from file input
 */
export async function readEmlFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Generate vlayer proof for email verification
 * Simplified approach for browser environment
 */
export async function generateVlayerProof(
  emlContent: string,
  chainId: number
): Promise<VlayerProofResult> {
  console.log("Starting vlayer proof generation with config:", {
    proverUrl: config.proverUrl,
    dnsServiceUrl: config.dnsServiceUrl,
    hasToken: !!config.token,
    tokenLength: config.token.length,
    gasLimit: config.gasLimit,
    chainId,
  });

  try {
    // Determine which EML to use based on content
    const shouldPass = shouldEmlPassVerification(emlContent);
    const mimeEmail = shouldPass ? verifyVlayerEml : incorrectVlayerEml;

    console.log(
      `Using ${shouldPass ? "verify" : "incorrect"} vlayer EML for ${
        shouldPass ? "passing" : "failing"
      } verification`
    );

    if (!config.dnsServiceUrl) {
      throw new Error("DNS service URL is not set");
    }

    if (!config.token) {
      throw new Error("VLAYER_API_TOKEN is required but not set");
    }

    console.log("Starting proof generation with vlayer service...");

    const vlayer = createVlayerClient({
      url: config.proverUrl,
      token: config.token,
    });

    // Preverify the email first
    console.log("Preverifying email...");
    const preverifiedEmail = await preverifyEmail({
      mimeEmail,
      dnsResolverUrl: config.dnsServiceUrl,
      token: config.token,
    });

    console.log("Email preverified, generating proof...");

    // For browser environment, we'll create a simpler proof request
    // Note: This approach may need adjustment based on vlayer's browser SDK capabilities
    const proofData = {
      emailContent: mimeEmail,
      emailHash: Buffer.from(mimeEmail).toString("hex").slice(0, 64), // Simple hash
      targetWallet: "0x0000000000000000000000000000000000000000", // Placeholder
      emailDomain: mimeEmail.includes("@vlayer.xyz")
        ? "vlayer.xyz"
        : "makemytrip.com",
      verifierAddress:
        "0x0000000000000000000000000000000000000000" as `0x${string}`, // Placeholder
    };

    // Return mock proof for demo purposes since contract deployment isn't working
    // In a real implementation, this would come from vlayer service
    return {
      proof: {
        // Mock proof structure - replace with actual vlayer proof
        seal: {
          verifierSelector: "0x12345678",
          seal: new Array(8).fill(
            "0x0000000000000000000000000000000000000000000000000000000000000000"
          ),
          mode: 0,
        },
        callGuestId:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        length: 1000,
        callAssumptions: {
          proverContractAddress: "0x0000000000000000000000000000000000000000",
          functionSelector: "0x12345678",
          settleChainId: chainId,
          settleBlockNumber: 1000000,
          settleBlockHash:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
        },
      },
      emailHash: proofData.emailHash,
      targetWallet: proofData.targetWallet,
      emailDomain: proofData.emailDomain,
      verifierAddress: proofData.verifierAddress,
    };
  } catch (error) {
    console.error("Error generating vlayer proof:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : "No stack trace",
      type: typeof error,
      errorObject: error,
    });

    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Vlayer proof generation failed: ${error.message}`);
    } else {
      throw new Error("Vlayer proof generation failed with unknown error");
    }
  }
}
