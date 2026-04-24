import { useState } from "react";
const PROCEDURES = [
  "Allergy Testing",
  "Ambulance Transport",
  "Appendectomy",
  "Arthroscopy (Knee)",
  "Arthroscopy (Shoulder)",
  "Biopsy (Skin/Dermatology)",
  "Cardiac Catheterization",
  "Cardiac Stress Test",
  "Carpal Tunnel Release",
  "Cataract Surgery",
  "Colonoscopy",
  "Colposcopy",
  "CT Scan (Abdomen)",
  "CT Scan (Chest)",
  "CT Scan (Head/Brain)",
  "CT Scan (Pelvis)",
  "CT Scan (Spine)",
  "DEXA Scan (Bone Density)",
  "Echocardiogram",
  "EEG (Brain Wave Test)",
  "EKG / ECG",
  "Emergency Room Visit",
  "Endoscopy (Upper GI / EGD)",
  "Epidural Steroid Injection",
  "ERCP",
  "Gallbladder Removal (Laparoscopic)",
  "Hernia Repair",
  "Hip Replacement",
  "Hysterectomy",
  "Knee Replacement",
  "Lab Work (Basic Metabolic Panel)",
  "Lab Work (CBC - Complete Blood Count)",
  "Lab Work (Comprehensive Metabolic Panel)",
  "Lab Work (Lipid Panel)",
  "Lab Work (Thyroid Panel)",
  "Mammogram (Diagnostic)",
  "Mammogram (Screening)",
  "MRI (Brain)",
  "MRI (Knee)",
  "MRI (Lumbar Spine)",
  "MRI (Shoulder)",
  "MRI (Cervical Spine)",
  "Nuclear Stress Test",
  "Pap Smear / Cervical Cytology",
  "PET Scan",
  "Physical Therapy (Initial Evaluation)",
  "Physical Therapy (Follow-up Visit)",
  "Primary Care Office Visit",
  "Prostate Biopsy",
  "Pulmonary Function Test",
  "Rotator Cuff Repair",
  "Sleep Study (Polysomnography)",
  "Specialist Office Visit",
  "Spinal Fusion",
  "Tonsillectomy",
  "Ultrasound (Abdominal)",
  "Ultrasound (Pelvic)",
  "Ultrasound (Thyroid)",
  "Urgent Care Visit",
  "X-Ray (Chest)",
  "X-Ray (Extremity)",
  "X-Ray (Spine)",];
  const PLAN_TYPES = ["HMO","PPO","EPO","HDHP","POS","Medicare Advantage","Medicaid Managed Care"];
const NETWORK_STATUS = ["In-Network","Out-of-Network"];
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
export default function App() {
  const [form, setForm] = useState({insurerName:"",memberId:"",planType:"",networkStatus:"In-Network",deductible:"",deductibleMet:"",oopMax:"",oopMet:"",coinsurance:"",copay:"",procedure:""});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const handleEstimate = async () => {
    if (!form.procedure||!form.planType||!form.deductible){setError("Please fill in Procedure, Plan Type, and Deductible at minimum.");return;}
    setError("");setLoading(true);setResult(null);
    const prompt = `You are a healthcare cost estimation engine. Patient details: Insurer: ${form.insurerName||"Unknown"}, Plan: ${form.planType}, Network: ${form.networkStatus}, Procedure: ${form.procedure}, Deductible: $${form.deductible}, Deductible Met: $${form.deductibleMet||0}, OOP Max: $${form.oopMax||"Unknown"}, OOP Met: $${form.oopMet||0}, Coinsurance: ${form.coinsurance||"Unknown"}%, Copay: $${form.copay||0}. Respond ONLY with valid JSON: {"procedureCost":<number>,"allowedAmount":<number>,"deductibleApplied":<number>,"coinsuranceAmount":<number>,"copayAmount":<number>,"estimatedPatientCost":<number>,"planPays":<number>,"oopRemaining":<number>,"confidence":"high","notes":"<explanation>","priorAuthRequired":false,"priorAuthNote":""}`;
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data = await response.json();
      const text = data.content?.map(b=>b.text||"").join("")||"";
      setResult(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(e){setError("Could not generate estimate. Please try again.");}
    setLoading(false);
  };
  return (
    <div style={{minHeight:"100vh",background:"#060f1a",fontFamily:"sans-serif",color:"#e0e0e0",display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 16px"}}>
      <h1 style={{color:"#64b5f6",marginBottom:"8px"}}>ClearCost</h1>
      <p style={{color:"#546e7a",marginBottom:"32px"}}>AI-powered insurance cost estimator</p>
      <div style={{width:"100%",maxWidth:"500px",display:"flex",flexDirection:"column",gap:"16px"}}>
        <div style={{background:"#0a1a2b",border:"1px solid #132d47",borderRadius:"12px",padding:"20px"}}>
          <p style={{color:"#64b5f6",fontSize:"0.75rem",textTransform:"uppercase",marginBottom:"12px"}}>Insurance Info</p>
          <input placeholder="Insurance Company" value={form.insurerName} onChange={e=>set("insurerName",e.target.value)} style={{width:"100%",background:"#0a1e30",border:"1px solid #1e3a5f",color:"#e0e0e0",borderRadius:"8px",padding:"10px",marginBottom:"10px",boxSizing:"border-box"}}/>
          <select value={form.planType} onChange={e=>set("planType",e.target.value)} style={{width:"100%",background:"#0a1e30",border:"1px solid #1e3a5f",color:"#e0e0e0",borderRadius:"8px",padding:"10px",marginBottom:"10px"}}>
            <option value="">Select Plan Type *</option>
            {PLAN_TYPES.map(p=><option key={p}>{p}</option>)}
          </select>
          <select value={form.networkStatus} onChange={e=>set("networkStatus",e.target.value)} style={{width:"100%",background:"#0a1e30",border:"1px solid #1e3a5f",color:"#e0e0e0",borderRadius:"8px",padding:"10px"}}>
            {NETWORK_STATUS.map(n=><option key={n}>{n}</option>)}
          </select>
        </div>
        <div style={{background:"#0a1a2b",border:"1px solid #132d47",borderRadius:"12px",padding:"20px"}}>
          <p style={{color:"#64b5f6",fontSize:"0.75rem",textTransform:"uppercase",marginBottom:"12px"}}>Benefits</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
            {[["deductible","Deductible *"],["deductibleMet","Deductible Met"],["oopMax","OOP Max"],["oopMet","OOP Met"],["coinsurance","Coinsurance %"],["copay","Copay $"]].map(([k,label])=>(
              <input key={k} type="number" placeholder={label} value={form[k]} onChange={e=>set(k,e.target.value)} style={{background:"#0a1e30",border:"1px solid #1e3a5f",color:"#e0e0e0",borderRadius:"8px",padding:"10px"}}/>
            ))}
          </div>
        </div>
        <div style={{background:"#0a1a2b",border:"1px solid #132d47",borderRadius:"12px",padding:"20px"}}>
          <p style={{color:"#64b5f6",fontSize:"0.75rem",textTransform:"uppercase",marginBottom:"12px"}}>Procedure</p>
          <select value={form.procedure} onChange={e=>set("procedure",e.target.value)} style={{width:"100%",background:"#0a1e30",border:"1px solid #1e3a5f",color:"#e0e0e0",borderRadius:"8px",padding:"10px"}}>
            <option value="">Select Procedure *</option>
            {PROCEDURES.map(p=><option key={p}>{p}</option>)}
          </select>
        </div>
        {error&&<div style={{background:"#1a0a0a",border:"1px solid #c62828",borderRadius:"8px",padding:"12px",color:"#ef9a9a"}}>{error}</div>}
        <button onClick={handleEstimate} disabled={loading} style={{background:"#1565c0",color:"#fff",border:"none",borderRadius:"10px",padding:"14px",fontSize:"1rem",cursor:"pointer",width:"100%"}}>
          {loading?"Estimating...":"Get My Cost Estimate →"}
        </button>
        {result&&(
          <div style={{background:"#0a1a2b",border:"1px solid #1565c0",borderRadius:"12px",padding:"20px"}}>
            <p style={{color:"#64b5f6",fontSize:"0.75rem",textTransform:"uppercase",marginBottom:"16px"}}>Cost Estimate</p>
            <div style={{textAlign:"center",background:"#060f1a",borderRadius:"8px",padding:"16px",marginBottom:"16px"}}>
              <p style={{color:"#607d8b",fontSize:"0.75rem",marginBottom:"4px"}}>YOUR ESTIMATED COST</p>
              <p style={{fontSize:"2.5rem",fontWeight:"bold",color:"#64b5f6",margin:0}}>${result.estimatedPatientCost?.toLocaleString()}</p>
              <p style={{color:"#546e7a",fontSize:"0.85rem"}}>Plan pays: <span style={{color:"#81c784"}}>${result.planPays?.toLocaleString()}</span></p>
            </div>
            {[["Billed Amount",result.procedureCost],["Allowed Amount",result.allowedAmount],["Deductible Applied",result.deductibleApplied],["Coinsurance",result.coinsuranceAmount]].map(([label,val])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                <span style={{color:"#90a4ae",fontSize:"0.85rem"}}>{label}</span>
                <span style={{color:"#e0e0e0",fontWeight:"bold"}}>${val?.toLocaleString()}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid #132d47",marginTop:"12px",paddingTop:"12px",fontSize:"0.85rem",color:"#78909c"}}>{result.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}
