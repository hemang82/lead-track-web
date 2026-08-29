import AxiosClientApi from "./axios.services";

const AUTH = "auth";
const LEADS = "leads";

export function login(request) {
  return AxiosClientApi.post(`/${AUTH}/login`, request);
}

export function getUserDetails(id) {
  return AxiosClientApi.get(`/${AUTH}/user-details/${id}`);
}

export function getDashboardStats(params = {}) {
  return AxiosClientApi.get(`/${LEADS}/dashboard`, { params });
}

export function getAllLeads(params = {}) {
  return AxiosClientApi.get(`/${LEADS}`, { params });
}

export function getLeadDetails(id) {
  return AxiosClientApi.get(`/${LEADS}/${id}`);
}

export function createLead(request) {
  return AxiosClientApi.post(`/${LEADS}`, request);
}

export function updateLead(id, request) {
  return AxiosClientApi.patch(`/${LEADS}/${id}`, request);
}

export function deleteLead(id) {
  return AxiosClientApi.delete(`/${LEADS}/${id}`);
}

export function getNotesByLead(leadId) {
  return AxiosClientApi.get(`/${LEADS}/${leadId}/notes`);
}

export function addNote(leadId, request) {
  return AxiosClientApi.post(`/${LEADS}/${leadId}/notes`, request);
}

export function updateNote(noteId, request) {
  return AxiosClientApi.patch(`/${LEADS}/notes/${noteId}`, request);
}

export function deleteNote(noteId) {
  return AxiosClientApi.delete(`/${LEADS}/notes/${noteId}`);
}
