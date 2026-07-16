-- ============================================================================
-- Add editable HTML receipt template (rendered to PDF per client)
-- ============================================================================

insert into public.settings (key, value)
values ('receipt_template', to_jsonb('
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: sans-serif; margin: 40px; color: #1a1a1a; }
    .header { text-align: center; margin-bottom: 32px; }
    .header h1 { font-size: 22px; margin: 0 0 4px; }
    .header p { margin: 0; color: #555; font-size: 13px; }
    .info { margin-bottom: 24px; }
    .info td { padding: 4px 12px 4px 0; font-size: 13px; }
    .info td:first-child { color: #555; }
    table { width: 100%%; border-collapse: collapse; }
    th, td { padding: 8px 12px; text-align: left; font-size: 13px; }
    th { background: #f5f5f5; font-weight: 600; }
    td { border-bottom: 1px solid #eee; }
    .total { text-align: right; font-size: 16px; font-weight: 700; margin-top: 20px; }
    .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reçu de paiement</h1>
    <p>{{school_name}}</p>
    <p>N° {{receipt_number}}</p>
  </div>
  <table class="info">
    <tr><td>Date</td><td>{{date}}</td></tr>
    <tr><td>Famille</td><td>{{parent_name}}</td></tr>
    <tr><td>Élève(s)</td><td>{{children_names}}</td></tr>
    <tr><td>Période</td><td>{{period}}</td></tr>
  </table>
  <table>
    <thead>
      <tr><th>Libellé</th><th>Montant</th></tr>
    </thead>
    <tbody>
      <tr><td>Frais mensuels</td><td>{{monthly_fee}} MAD</td></tr>
      <tr><td>Remise fratrie ({{remise}}%)</td><td>- {{discount_amount}} MAD</td></tr>
      <tr><td>Total dû</td><td>{{amount_due}} MAD</td></tr>
      <tr><td>Payé le {{payment_date}}</td><td>{{amount_paid}} MAD</td></tr>
    </tbody>
  </table>
  <div class="total">
    Restant dû : {{remaining}} MAD
  </div>
  <div class="footer">
    {{school_name}}   {{school_address}}   {{school_phone}}
  </div>
</body>
</html>
'::text)) on conflict (key) do nothing;
