import React, { useState } from 'react';

export default function PickupForm({ token, api }){
  const [form,setForm] = useState({ name:'', phone:'', email:'', address:'', preferredDate:'', items:'' });
  const [msg,setMsg] = useState('');
  const submit = async e=>{
    e.preventDefault();
    const res = await fetch(api + '/pickups', { method:'POST', headers:{ 'content-type':'application/json', Authorization: 'Bearer '+token }, body: JSON.stringify(form)});
    const data = await res.json();
    if(res.ok){ setMsg('Pickup requested'); setForm({name:'',phone:'',email:'',address:'',preferredDate:'',items:''}); }
    else setMsg(data.error || 'Error');
  };
  return (<form onSubmit={submit}><input placeholder='Name' value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /><input placeholder='Phone' value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required /><input placeholder='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /><input placeholder='Preferred date/time' value={form.preferredDate} onChange={e=>setForm({...form,preferredDate:e.target.value})} /><textarea placeholder='Items description' value={form.items} onChange={e=>setForm({...form,items:e.target.value})} /><input placeholder='Pickup address' value={form.address} onChange={e=>setForm({...form,address:e.target.value})} required /><button>Request Pickup</button><div style={{color:'green'}}>{msg}</div></form>)
}
