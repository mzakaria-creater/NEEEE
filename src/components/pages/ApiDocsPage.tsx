/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Terminal, 
  BookOpen, 
  Check, 
  Copy, 
  ArrowRight, 
  Code, 
  Database,
  Layers,
  HelpCircle
} from 'lucide-react';

interface ApiDocsPageProps {
  isArabic?: boolean;
}

export function ApiDocsPage({ isArabic = false }: ApiDocsPageProps) {
  const [activeLang, setActiveLang] = useState<'javascript' | 'python' | 'go' | 'php' | 'curl'>('javascript');
  const [copiedId, setCopiedId] = useState("");

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(field);
    setTimeout(() => setCopiedId(""), 2200);
  };

  const codeSamples = {
    javascript: `// Initialize Checkout transaction session using OnTarget JS SDK
const OnTarget = require('@ontarget/gateway-node');
const client = new OnTarget({ apiKey: 'pk_live_7729_maven_0a8b9c' });

const session = await client.sessions.create({
  amount: 3500,
  currency: 'EGP',
  provider: 'Vodafone Cash',
  customer: {
    name: 'Sherif Aly',
    phone: '01004928172'
  },
  order_id: 'ORD-90123'
});

console.log('Checkout URL:', session.checkout_url);`,

    python: `# Generate session via Python requests
import requests

headers = {
    'x-api-key': 'pk_live_7729_maven_0a8b9c',
    'Content-Type': 'application/json'
}

payload = {
    "amount": 3500,
    "currency": "EGP",
    "provider": "Vodafone Cash",
    "customer": {
        "name": "Sherif Aly",
        "phone": "01004928172"
    },
    "order_id": "ORD-90123"
}

response = requests.post(
    'https://api.ontarget.net/v1/sessions',
    headers=headers,
    json=payload
)

print('Checkout URL:', response.json()['checkout_url'])`,

    go: `package main

import (
	"bytes"
	"fmt"
	"net/http"
)

func main() {
	url := "https://api.ontarget.net/v1/sessions"
	payload := []byte(\`{
		"amount": 3500,
		"currency": "EGP",
		"provider": "Vodafone Cash",
		"customer": {
			"name": "Sherif Aly",
			"phone": "01004928172"
		},
		"order_id": "ORD-90123"
	}\`)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	req.Header.Set("x-api-key", "pk_live_7729_maven_0a8b9c")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, _ := client.Do(req)
	fmt.Println("Status Code:", resp.StatusCode)
}`,

    php: `<?php
// Initialize session using cURL in PHP
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "https://api.ontarget.net/v1/sessions",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POSTFIELDS => json_encode([
    "amount" => 3500,
    "currency" => "EGP",
    "provider" => "Vodafone Cash",
    "customer" => [
        "name" => "Sherif Aly",
        "phone" => "01004928172"
    ],
    "order_id" => "ORD-90123"
  ]),
  CURLOPT_HTTPHEADER => [
    "x-api-key: pk_live_7729_maven_0a8b9c",
    "Content-Type: application/json"
  ]
]);

$response = curl_exec($curl);
print_r(json_decode($response, true));
?>`,

    curl: `curl -X POST https://api.ontarget.net/v1/sessions \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: pk_live_7729_maven_0a8b9c" \\
  -d '{
    "amount": 3500,
    "currency": "EGP",
    "provider": "Vodafone Cash",
    "customer": {
      "name": "Sherif Aly",
      "phone": "01004928172"
    },
    "order_id": "ORD-90123"
  }'`
  };

  const responseSample = `{
  "id": "ses_9a8b7c6d5e4f",
  "object": "checkout.session",
  "checkout_url": "https://pay.ontarget.net/checkout?session=ey...",
  "amount": 3500,
  "currency": "EGP",
  "provider": "Vodafone Cash",
  "status": "created",
  "created_at": "2026-06-09T23:21:00Z"
}`;

  return (
    <div className="space-y-6 text-left animate-[fade-in_0.3s_ease]">
      
      {/* Header Banner */}
      <div className="bg-zinc-950 p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest block font-mono">
            {isArabic ? "موسوعة إرشادات المطورين والـ API" : "DEVELOPER PROTOCOLS REFERENCE"}
          </span>
          <h1 className="text-xl font-black text-white font-sans">
            {isArabic ? "المستندات البرمجية وربط المطورين" : "Interactive API Reference Docs"}
          </h1>
          <p className="text-xs text-neutral-400 leading-relaxed font-sans">
            {isArabic 
              ? "مواصفات ربط خوادم المتاجر وبث جلسات التحويل P2P مع استرجاع حالات الدفع الفورية"
              : "Stripe-style documentation detailing how to initiate sessions, listen to webhooks, and evaluate signature matches."}
          </p>
        </div>
      </div>

      {/* STRIPE-STYLE DOUBLE COLUMNS API DOCS PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* TEXT DOCUMENTATION PART (Lg 6) */}
        <div className="lg:col-span-6 space-y-6 text-zinc-300 font-sans text-xs leading-relaxed max-w-xl">
          
          {/* Paragraph section 1: Auth */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-white flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Authentication</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed font-sans">
              Authenticate your API requests by passing your publishable <code>X-API-KEY</code> parameter as an HTTP header on payload endpoints. All API requests must be performed over secure SSL structures.
            </p>
            <div className="bg-neutral-900 border border-white/5 p-3 rounded-xl font-mono text-[10.5px]">
              <code className="text-zinc-500">Headers Map:</code>
              <code className="block text-white mt-1">x-api-key: pk_live_7729_maven_0a8b9c</code>
            </div>
          </div>

          {/* Paragraph section 2: Sessions */}
          <div className="space-y-3 border-t border-white/5 pt-5">
            <h3 className="text-sm font-black text-white">Create Checkout Session</h3>
            <p className="text-zinc-400 leading-relaxed font-sans">
              To represent a checkout gateway interface, perform a POST request with the specified body parameters containing Amount, Currency, and Client Metadata details.
            </p>

            <div className="space-y-2 font-mono text-[11px] leading-relaxed">
              <span className="text-[9px] text-zinc-500 uppercase block">Required Body Parameters</span>
              
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-white font-bold font-mono text-xs">amount</span>
                <span className="text-zinc-500 text-[10px]">integer (Required) - Slip volume in EGP</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span className="text-white font-bold font-mono text-xs">currency</span>
                <span className="text-zinc-500 text-[10px]">string (Required) - Constant e.g. "EGP"</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5 font-mono">
                <span className="text-white font-bold font-mono text-xs">provider</span>
                <span className="text-zinc-500 text-[10px]">string - Vodafone Cash, InstaPay, Orange Money</span>
              </div>
            </div>
          </div>

        </div>

        {/* CODE PLAYGROUND PART (Lg 6) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* Multi Language Tabs Terminal */}
          <div className="bg-black border border-white/10 rounded-2xl overflow-hidden font-mono text-xs text-left shadow-2xl">
            
            {/* Tab switchers language */}
            <div className="flex bg-neutral-950 border-b border-white/5 px-2 text-[10px]">
              {(['javascript', 'python', 'go', 'php', 'curl'] as const).map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`py-2 px-3 hover:text-white transition-all font-bold font-mono border-t-2 uppercase ${
                    activeLang === lang ? 'border-t-amber-400 text-amber-500 bg-neutral-900/40' : 'border-t-transparent text-neutral-500'
                  }`}
                >
                  {lang}
                </button>
              ))}
              <button 
                onClick={() => handleCopy(activeLang, codeSamples[activeLang])}
                className="text-[9px] font-black text-zinc-500 hover:text-white uppercase ml-auto pr-2 select-none"
              >
                {copiedId === activeLang ? 'Copied' : 'Copy Sample'}
              </button>
            </div>

            {/* Selected Code Code */}
            <pre className="p-4 bg-neutral-900/10 overflow-x-auto text-[10px] leading-relaxed text-zinc-350 h-72 no-scrollbar select-all">
              {codeSamples[activeLang]}
            </pre>
          </div>

          {/* Response Payload Block */}
          <div className="bg-black border border-white/10 rounded-2xl overflow-hidden font-mono text-xs text-left shadow-2xl">
            <div className="px-4 py-2 bg-neutral-950 border-b border-white/5 flex justify-between items-center text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
              <span>SAMPLE HTTP 201 RESPONSE PAYLOAD</span>
              <span className="text-emerald-400 font-black animate-pulse">● HTTP 201 Created</span>
            </div>
            <pre className="p-4 bg-neutral-900/10 overflow-x-auto text-[9.5px] leading-relaxed text-zinc-400 h-48 no-scrollbar">
              {responseSample}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
}
