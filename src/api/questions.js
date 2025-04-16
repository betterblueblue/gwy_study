import axios from 'axios';

const baseURL = '/api';

export const getQuestions = async (params) => {
  const response = await axios.get(`${baseURL}/questions`, { params });
  return response.data;
};

export const createQuestion = async (data) => {
  const response = await axios.post(`${baseURL}/questions`, data);
  return response.data;
};

export const updateQuestion = async (id, data) => {
  const response = await axios.put(`${baseURL}/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id) => {
  await axios.delete(`${baseURL}/questions/${id}`);
};

export const importQuestions = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post(`${baseURL}/questions/import`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const exportQuestions = async () => {
  const response = await axios.get(`${baseURL}/questions/export`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'questions.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};