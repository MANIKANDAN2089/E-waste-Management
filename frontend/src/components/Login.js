import React, { useState } from 'react';
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Login({ onAuth }){
  const [form,setForm] = useState({email:'',password:''});
  const [msg,setMsg] = useState('');
  const submit = async (e)=>{
    e.preventDefault();
    const res = await fetch(API+'/auth/login',{method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(form)});
    const data = await res.json();
    if(res.ok){ localStorage.setItem('token', data.token); localStorage.setItem('user', JSON.stringify(data.user)); onAuth(data.token, data.user); }
    else setMsg(data.error || 'Error');
  };
  return (<form onSubmit={submit}><h3>Login</h3><input placeholder='Email' value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /><input placeholder='Password' type='password' value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /><button>Login</button><div style={{color:'red'}}>{msg}</div></form>)
}
