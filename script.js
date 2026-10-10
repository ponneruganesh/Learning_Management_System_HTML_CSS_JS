const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const titles = { dashboard: "Dashboard overview", patients: "Patient directory", doctors: "Medical staff", appointments: "Appointment management" };
const sample = {
  patients: [
    {id:1,name:"Aarav Sharma",age:32,gender:"Male",phone:"9876543210",condition:"Routine check-up"},
    {id:2,name:"Priya Reddy",age:27,gender:"Female",phone:"9876501234",condition:"Migraine"},
    {id:3,name:"Rahul Kumar",age:45,gender:"Male",phone:"9123456780",condition:"Blood pressure review"}
  ],
  doctors: [
    {id:1,name:"Dr. Meera Rao",specialty:"Cardiology",phone:"9000000001",availability:"Available"},
    {id:2,name:"Dr. Arjun Patel",specialty:"Neurology",phone:"9000000002",availability:"Available"},
    {id:3,name:"Dr. Sana Khan",specialty:"General Medicine",phone:"9000000003",availability:"On Leave"}
  ],
  appointments: [
    {id:1,patientId:1,patientName:"Aarav Sharma",doctorId:1,doctorName:"Dr. Meera Rao",date:"2026-10-12",time:"10:00",reason:"Routine check-up",status:"Scheduled"},
    {id:2,patientId:2,patientName:"Priya Reddy",doctorId:2,doctorName:"Dr. Arjun Patel",date:"2026-10-13",time:"11:30",reason:"Headache consultation",status:"Scheduled"}
  ]
};
function load(key) {
  try {
    const saved = localStorage.getItem("carepoint_" + key);
    return saved ? JSON.parse(saved) : sample[key].map(x => ({...x}));
  } catch { return sample[key].map(x => ({...x})); }
}
const state = { patients: load("patients"), doctors: load("doctors"), appointments: load("appointments") };
function save(key) { localStorage.setItem("carepoint_" + key, JSON.stringify(state[key])); }
function nextId(key) { return state[key].reduce((max, item) => Math.max(max, item.id), 0) + 1; }
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function notify(message, error=false) {
  const el=$("#notice"); el.textContent=message; el.classList.toggle("error",error); el.classList.remove("hidden");
  setTimeout(()=>el.classList.add("hidden"),3500);
}
function showPage(page) {
  $$(".page").forEach(p=>p.classList.add("hidden"));
  $(`#${page}-page`).classList.remove("hidden");
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  $("#page-title").textContent=titles[page];
  if(page==="patients") renderPatients();
  if(page==="doctors") renderDoctors();
  if(page==="appointments") renderAppointments();
}
function tag(status) { return `<span class="status ${esc(status)}">${esc(status)}</span>`; }
function renderDashboard() {
  $("#stat-patients").textContent=state.patients.length;
  $("#stat-doctors").textContent=state.doctors.length;
  $("#stat-appointments").textContent=state.appointments.length;
  $("#stat-scheduled").textContent=state.appointments.filter(a=>a.status==="Scheduled").length;
  const items=[...state.appointments].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);
  $("#recent-body").innerHTML=items.length?items.map(a=>`<tr><td>${esc(a.patientName)}</td><td>${esc(a.doctorName)}</td><td>${esc(a.date)}</td><td>${esc(a.time)}</td><td>${tag(a.status)}</td></tr>`).join(""):`<tr><td colspan="5">No appointments yet.</td></tr>`;
}
function renderPatients() {
  const q=($("#patient-search").value||"").toLowerCase();
  const list=state.patients.filter(p=>`${p.name} ${p.phone} ${p.condition}`.toLowerCase().includes(q));
  $("#patient-count").textContent=`${list.length} record(s)`;
  $("#patients-body").innerHTML=list.length?list.map(p=>`<tr><td>${esc(p.name)}<br><small>ID #${p.id}</small></td><td>${esc(p.age)} / ${esc(p.gender)}</td><td>${esc(p.phone)}</td><td>${esc(p.condition||"—")}</td><td><button class="delete-btn" data-delete-patient="${p.id}">Delete</button></td></tr>`).join(""):`<tr><td colspan="5">No patient records found.</td></tr>`;
}
function renderDoctors() {
  $("#doctors-grid").innerHTML=state.doctors.length?state.doctors.map(d=>`<article class="doctor-card"><div class="doctor-top"><div class="doctor-avatar">⚕</div><div><h3>${esc(d.name)}</h3><p>${esc(d.specialty)}</p></div></div><div class="doctor-info"><span>${esc(d.phone||"Phone not added")}</span>${tag(d.availability)}</div><div style="text-align:right;margin-top:15px"><button class="delete-btn" data-delete-doctor="${d.id}">Remove doctor</button></div></article>`).join(""):`<div class="panel" style="padding:25px">No doctors added yet.</div>`;
}
function renderAppointments() {
  const list=[...state.appointments].sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  $("#appointments-body").innerHTML=list.length?list.map(a=>`<tr><td>${esc(a.patientName)}</td><td>${esc(a.doctorName)}</td><td>${esc(a.date)}<br><small>${esc(a.time)}</small></td><td>${esc(a.reason||"—")}</td><td>${tag(a.status)}</td><td>${a.status==="Scheduled"?`<button class="select-btn" data-status="${a.id}" data-value="Completed">Complete</button><button class="delete-btn" data-status="${a.id}" data-value="Cancelled">Cancel</button>`:`<button class="delete-btn" data-delete-appointment="${a.id}">Delete</button>`}</td></tr>`).join(""):`<tr><td colspan="6">No appointments yet. Book one to get started.</td></tr>`;
}
function refresh() { renderDashboard(); const page=$(".page:not(.hidden)")?.id.replace("-page",""); if(page==="patients")renderPatients();if(page==="doctors")renderDoctors();if(page==="appointments")renderAppointments(); }
function openDialog(id) { $(`#${id}`).showModal(); }
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
$$("[data-close]").forEach(b=>b.addEventListener("click",()=> $(`#${b.dataset.close}`).close()));
$("#add-patient-btn").addEventListener("click",()=>openDialog("patient-dialog"));
$("#add-doctor-btn").addEventListener("click",()=>openDialog("doctor-dialog"));
$("#add-appointment-btn").addEventListener("click",()=>{
  if(!state.patients.length||!state.doctors.length)return notify("Add at least one patient and one doctor first.",true);
  $("#appointment-patient").innerHTML=state.patients.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
  $("#appointment-doctor").innerHTML=state.doctors.map(d=>`<option value="${d.id}">${esc(d.name)} — ${esc(d.specialty)}</option>`).join("");
  const today=new Date();today.setMinutes(today.getMinutes()-today.getTimezoneOffset());
  $("#appointment-form").elements.date.value=today.toISOString().slice(0,10);
  openDialog("appointment-dialog");
});
$("#patient-search").addEventListener("input",renderPatients);
$("#patient-form").addEventListener("submit",e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));
  state.patients.push({id:nextId("patients"),name:d.name.trim(),age:Number(d.age),gender:d.gender,phone:d.phone.trim(),condition:d.condition.trim()});
  save("patients");e.currentTarget.reset();$("#patient-dialog").close();refresh();showPage("patients");notify("Patient added successfully.");
});
$("#doctor-form").addEventListener("submit",e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));
  state.doctors.push({id:nextId("doctors"),name:d.name.trim(),specialty:d.specialty.trim(),phone:d.phone.trim(),availability:d.availability});
  save("doctors");e.currentTarget.reset();$("#doctor-dialog").close();refresh();showPage("doctors");notify("Doctor added successfully.");
});
$("#appointment-form").addEventListener("submit",e=>{
  e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));
  const p=state.patients.find(x=>x.id===Number(d.patientId)),doc=state.doctors.find(x=>x.id===Number(d.doctorId));
  if(!p||!doc)return notify("Please choose a valid patient and doctor.",true);
  state.appointments.push({id:nextId("appointments"),patientId:p.id,patientName:p.name,doctorId:doc.id,doctorName:doc.name,date:d.date,time:d.time,reason:d.reason.trim(),status:"Scheduled"});
  save("appointments");e.currentTarget.reset();$("#appointment-dialog").close();refresh();showPage("appointments");notify("Appointment booked successfully.");
});
document.addEventListener("click",e=>{
  const p=e.target.closest("[data-delete-patient]"),d=e.target.closest("[data-delete-doctor]"),a=e.target.closest("[data-delete-appointment]"),s=e.target.closest("[data-status]");
  if(p&&confirm("Delete this patient and their linked appointments?")) {
    const id=Number(p.dataset.deletePatient);state.patients=state.patients.filter(x=>x.id!==id);state.appointments=state.appointments.filter(x=>x.patientId!==id);save("patients");save("appointments");refresh();notify("Patient deleted.");
  }
  if(d&&confirm("Remove this doctor and their linked appointments?")) {
    const id=Number(d.dataset.deleteDoctor);state.doctors=state.doctors.filter(x=>x.id!==id);state.appointments=state.appointments.filter(x=>x.doctorId!==id);save("doctors");save("appointments");refresh();notify("Doctor removed.");
  }
  if(a&&confirm("Delete this appointment?")) {state.appointments=state.appointments.filter(x=>x.id!==Number(a.dataset.deleteAppointment));save("appointments");refresh();notify("Appointment deleted.");}
  if(s) {const item=state.appointments.find(x=>x.id===Number(s.dataset.status));if(item){item.status=s.dataset.value;save("appointments");refresh();notify(`Appointment marked ${item.status.toLowerCase()}.`);}}
});
refresh();
