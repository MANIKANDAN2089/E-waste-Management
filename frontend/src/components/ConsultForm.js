import React, { useState } from 'react';

export default function ConsultForm({ token, api }){
  const [form,setForm] = useState({ name:'', phone:'', email:'', category:'General', description:'', preferredDate:'', mode:'call' });
  const [msg,setMsg] = useState('');
  const submit = async e=>{
    e.preventDefault();
    const res = await fetch(api + '/consults', { method:'POST', headers:{ 'content-type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify(form)});
    const data = await res.json();
    if(res.ok){ setMsg('Consultation requested'); setForm({ name:'', phone:'', email:'', category:'General', description:'', preferredDate:'', mode:'call' }); }
    else setMsg(data.error || 'Error');
  };
  return (<form onSubmit={submit}><input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /><input placeholder='Phone' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /><input placeholder='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>General</option><option>Recycling</option><option>Repair</option></select><textarea placeholder='Describe your issue' value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /><input placeholder='Preferred date/time' value={form.preferredDate} onChange={e=>setForm({...form,preferredDate:e.target.value})} /><select value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}><option value='call'>Call</option><option value='video'>Video</option><option value='in-person'>In-person</option></select><button>Request Consult</button><div style={{color:'green'}}>{msg}</div></form>)
}
