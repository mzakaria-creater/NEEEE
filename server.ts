import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config'; // Support loading environment variables locally

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for automatic JSON parsing
  app.use(express.json());

  // Setup Server-side Supabase Connection
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  let supabase: any = null;
  if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-supabase-project') && supabaseUrl.trim() !== '') {
    try {
      supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('Server API: Supabase cloud node connected successfully.');
    } catch (err) {
      console.error('Server API: Failed to connect to Supabase:', err);
    }
  } else {
    console.log('Server API: Running in localized in-memory state. (Update .env to connect physical Supabase instance)');
  }

  // Backup In-memory P2P Ledger state
  let inMemoryTransactions: any[] = [
    {
      id: "TXN-99102388",
      checkout_token: "tok_secure_88a7b32c90e1",
      merchant_id: "MID_7729_EGY",
      merchant_name: "Maven Consulting",
      customer_name: "Ahmed Khaled",
      customer_phone: "01012345678",
      amount: 1250,
      currency: "EGP",
      type: "deposit",
      method: "Vodafone Cash",
      paymentMethod: "Vodafone Cash",
      status: "pending",
      created_at: "2026-06-09T05:50:00Z",
      risk_level: "low",
      riskLevel: "low",
      category: "other"
    },
    {
      id: "TXN-88210A",
      checkout_token: "tok_secure_88a7b32c90e2",
      merchant_id: "MID_7729_EGY",
      merchant_name: "Maven Consulting",
      customer_name: "Mina Khaled",
      customer_phone: "01099238122",
      amount: 3500,
      currency: "EGP",
      type: "deposit",
      method: "InstaPay",
      paymentMethod: "InstaPay",
      status: "completed",
      created_at: "2026-06-08T14:22:00Z",
      risk_level: "low",
      riskLevel: "low",
      category: "electronics"
    },
    {
      id: "TXN-77341200",
      checkout_token: "tok_secure_88a7b32c90e3",
      merchant_id: "MER_MASTER_001",
      merchant_name: "Goldex PSP",
      customer_name: "Omar Farouk",
      customer_phone: "01211029384",
      amount: 4500,
      currency: "EGP",
      type: "deposit",
      method: "WE Pay",
      paymentMethod: "WE Pay",
      status: "review",
      created_at: "2026-06-09T09:12:00Z",
      risk_level: "medium",
      riskLevel: "medium",
      category: "luxury"
    }
  ];

  // -----------------------------------------
  // REST API Payment Gateway Routes
  // -----------------------------------------

  // Health probe route
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", databaseConnected: !!supabase });
  });

  // GET: Retrieve all active transaction ledger rows
  app.get("/api/transactions", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('p2p_transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const formatted = data.map((row: any) => ({
            id: row.id,
            amount: Number(row.amount),
            currency: row.currency,
            status: row.status,
            customer_name: row.customer_name,
            senderName: row.customer_name,
            customer_phone: row.customer_phone,
            method: row.method_channel,
            paymentMethod: row.method_channel,
            risk_level: row.risk_level,
            riskLevel: row.risk_level,
            category: row.category,
            created_at: row.created_at,
            timestamp: row.created_at,
          }));
          return res.json({ success: true, count: formatted.length, data: formatted });
        } else if (error) {
          console.warn("Supabase query connection info:", error.message || error);
        }
      } catch (err: any) {
        console.error("Supabase request exception:", err);
      }
    }
    // Return custom in-memory backup state
    return res.json({ success: true, count: inMemoryTransactions.length, data: inMemoryTransactions, fallback: true });
  });

  // POST: Initiate a secure checkout invoice / payment transaction
  app.post("/api/transactions", async (req, res) => {
    const txn = req.body;
    if (!txn.id) {
      txn.id = `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;
    }
    if (!txn.created_at) {
      txn.created_at = new Date().toISOString();
    }
    if (!txn.timestamp) {
      txn.timestamp = txn.created_at;
    }
    
    const am = Number(txn.amount) || 0;
    txn.fees = Number((am * 0.01).toFixed(2));
    txn.net_amount = Number((am - txn.fees).toFixed(2));

    if (supabase) {
      try {
        const { error } = await supabase
          .from('p2p_transactions')
          .upsert({
            id: txn.id,
            amount: am,
            currency: txn.currency || 'EGP',
            status: txn.status || 'pending',
            customer_name: txn.customer_name || txn.senderName || '',
            customer_phone: txn.customer_phone || txn.sender_phone || '',
            method_channel: txn.method || txn.paymentMethod || '',
            risk_level: txn.riskLevel || txn.risk_level || 'low',
            category: txn.category || 'other',
            created_at: txn.created_at
          }, { onConflict: 'id' });

        if (error) {
          console.error("Supabase payment create insertion error:", error);
        } else {
          console.log(`Successfully persisted transaction ${txn.id} to Supabase`);
        }
      } catch (err) {
        console.error("Supabase general execution catch error:", err);
      }
    }

    const index = inMemoryTransactions.findIndex(t => t.id === txn.id);
    if (index !== -1) {
      inMemoryTransactions[index] = { ...inMemoryTransactions[index], ...txn };
    } else {
      inMemoryTransactions.unshift(txn);
    }

    return res.json({ success: true, data: txn });
  });

  // POST: Bulk/Batch transaction approval or rejection
  app.post("/api/transactions/batch-update", async (req, res) => {
    const { ids, status, reason } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ success: false, error: "Invalid array of target IDs" });
    }

    if (supabase) {
      try {
        const updateData: any = { status };
        if (reason) updateData.audit_note = reason;

        const { error } = await supabase
          .from('p2p_transactions')
          .update(updateData)
          .in('id', ids);

        if (error) throw error;
      } catch (err: any) {
        console.error("Supabase batch sync update error:", err);
      }
    }

    inMemoryTransactions = inMemoryTransactions.map(t => {
      if (ids.includes(t.id)) {
        return {
          ...t,
          status,
          reason: reason || t.reason,
          audit_note: reason || t.audit_note,
          updated_at: new Date().toISOString()
        };
      }
      return t;
    });

    return res.json({ success: true, message: `Successfully changed status of ${ids.length} transactions.` });
  });

  // POST: Core audit action update single transaction state (approve/decline/proof)
  app.post("/api/transactions/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status, audit_note, approved_by, reason, proof_url } = req.body;

    let updatedTxn: any = null;

    if (supabase) {
      try {
        const updatePayload: any = {};
        if (status) updatePayload.status = status;
        if (reason || audit_note) {
          updatePayload.audit_note = reason || audit_note;
        }

        const { data, error } = await supabase
          .from('p2p_transactions')
          .update(updatePayload)
          .eq('id', id)
          .select();

        if (error) throw error;
        if (data && data.length > 0) {
          updatedTxn = data[0];
        }
      } catch (err: any) {
        console.error("Supabase single record update error:", err);
      }
    }

    const idx = inMemoryTransactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      inMemoryTransactions[idx] = {
        ...inMemoryTransactions[idx],
        status: status || inMemoryTransactions[idx].status,
        audit_note: audit_note || reason || inMemoryTransactions[idx].audit_note,
        reason: reason || inMemoryTransactions[idx].reason,
        proof_url: proof_url || inMemoryTransactions[idx].proof_url,
        updated_at: new Date().toISOString()
      };
      updatedTxn = inMemoryTransactions[idx];
    } else {
      updatedTxn = {
        id,
        status: status || 'pending',
        amount: 250,
        currency: 'EGP',
        customer_name: 'Custom Web Owner',
        customer_phone: '01012345678',
        method: 'InstaPay',
        ...req.body,
        updated_at: new Date().toISOString()
      };
      inMemoryTransactions.unshift(updatedTxn);
    }

    return res.json({ success: true, data: updatedTxn });
  });

  // POST: Mock/External callback dispatcher interface for callbacks or external webhooks
  app.post("/api/payments/callback", async (req, res) => {
    const { transactionId, status, senderName, amount, providerReference } = req.body;
    if (!transactionId) {
      return res.status(400).json({ error: "transactionId parameter must be provided" });
    }

    console.log(`Payment Hub Webhook: callback processed for ID ${transactionId} [status: ${status}]`);

    const finalStatus = status || 'approved';
    const note = `Auto-approved via callback handshaking. Merchant node reference: ${providerReference || 'GATEWAY-' + Math.floor(Math.random() * 1000000)}`;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('p2p_transactions')
          .select('*')
          .eq('id', transactionId);

        if (!error && data && data.length > 0) {
          await supabase
            .from('p2p_transactions')
            .update({
              status: finalStatus,
              audit_note: note
            })
            .eq('id', transactionId);
        } else {
          await supabase
            .from('p2p_transactions')
            .upsert({
              id: transactionId,
              amount: Number(amount) || 2000,
              currency: 'EGP',
              status: finalStatus,
              customer_name: senderName || 'External Gateway Merchant Client',
              customer_phone: '01211223344',
              method_channel: 'Gateway Callback Switch',
              created_at: new Date().toISOString(),
              audit_note: note
            });
        }
      } catch (err: any) {
        console.error("Webhook processing on physical table failed:", err);
      }
    }

    const idx = inMemoryTransactions.findIndex(t => t.id === transactionId);
    if (idx !== -1) {
      inMemoryTransactions[idx] = {
        ...inMemoryTransactions[idx],
        status: finalStatus,
        audit_note: note,
        updated_at: new Date().toISOString()
      };
    } else {
      inMemoryTransactions.unshift({
        id: transactionId,
        amount: Number(amount) || 2000,
        currency: 'EGP',
        status: finalStatus,
        customer_name: senderName || 'External Gateway Merchant Client',
        customer_phone: '01211223344',
        method: 'Callback Switch',
        created_at: new Date().toISOString(),
        audit_note: note
      });
    }

    return res.json({ success: true, message: "Webhook processed and synced successfully." });
  });

  // -----------------------------------------
  // SMS Payloads & Email Transactions APIs
  // -----------------------------------------
  let inMemorySmsPayloads: any[] = [
    {
      id: "EVT-8812A",
      source: "sms",
      raw_payload: "Vodafone Cash Alert: Received EGP 1250 from 01012345678",
      received_at: "2026-06-03T05:50:00Z",
      processed: true,
      matched_transaction_id: "TXN-99102388"
    }
  ];

  let inMemoryEmailTransactions: any[] = [
    {
      id: "EML-48210A",
      sender: "ngpay-billing@secure-gateway.net",
      recipient_email: "MinaFx2@gmail.com",
      subject: "ngPay Incoming Remit Match Notification",
      body: "Vodafone Cash Transfer deposit confirmation of 3500.00 EGP received from M. Khaled. Code reference TXN-88201A.",
      amount: 3500,
      reference: "TXN-88210A",
      status: "matched",
      received_at: "2026-06-05T14:22:00Z"
    }
  ];

  app.get("/api/sms-payloads", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('sms_payloads')
          .select('*')
          .order('received_at', { ascending: false });

        if (!error && data) {
          return res.json({ success: true, count: data.length, data });
        }
      } catch (err) {
        console.warn("Supabase SMS query failed, fallback active:", err);
      }
    }
    return res.json({ success: true, count: inMemorySmsPayloads.length, data: inMemorySmsPayloads });
  });

  app.post("/api/sms-payloads", async (req, res) => {
    const sms = req.body;
    if (!sms.id) sms.id = `EVT-${Math.floor(10000 + Math.random() * 90000)}`;
    if (!sms.received_at) sms.received_at = new Date().toISOString();

    if (supabase) {
      try {
        await supabase.from('sms_payloads').upsert({
          id: sms.id,
          source: sms.source || 'sms',
          raw_payload: sms.raw_payload,
          received_at: sms.received_at,
          processed: sms.processed ?? false,
          matched_transaction_id: sms.matched_transaction_id || null
        }, { onConflict: 'id' });
      } catch (err) {
        console.error("Supabase SMS write failed:", err);
      }
    }
    const idx = inMemorySmsPayloads.findIndex(x => x.id === sms.id);
    if (idx !== -1) inMemorySmsPayloads[idx] = sms;
    else inMemorySmsPayloads.unshift(sms);

    return res.json({ success: true, data: sms });
  });

  app.get("/api/email-transactions", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('email_transactions')
          .select('*')
          .order('received_at', { ascending: false });

        if (!error && data) {
          return res.json({ success: true, count: data.length, data });
        }
      } catch (err) {
        console.warn("Supabase Email query failed, fallback active:", err);
      }
    }
    return res.json({ success: true, count: inMemoryEmailTransactions.length, data: inMemoryEmailTransactions });
  });

  app.post("/api/email-transactions", async (req, res) => {
    const email = req.body;
    if (!email.id) email.id = `EML-${Math.floor(10000 + Math.random() * 90000)}`;
    if (!email.received_at) email.received_at = new Date().toISOString();

    if (supabase) {
      try {
        await supabase.from('email_transactions').upsert({
          id: email.id,
          sender: email.sender,
          recipient_email: email.recipient_email || 'MinaFx2@gmail.com',
          subject: email.subject,
          body: email.body,
          amount: Number(email.amount),
          reference: email.reference || null,
          status: email.status || 'unmatched',
          received_at: email.received_at
        }, { onConflict: 'id' });
      } catch (err) {
        console.error("Supabase Email write failed:", err);
      }
    }
    const idx = inMemoryEmailTransactions.findIndex(x => x.id === email.id);
    if (idx !== -1) inMemoryEmailTransactions[idx] = email;
    else inMemoryEmailTransactions.unshift(email);

    return res.json({ success: true, data: email });
  });

  // -----------------------------------------
  // Vite Middleware mounting
  // -----------------------------------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production bundle static server mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server actively running on port ${PORT}`);
  });
}

startServer();
