const formData = new FormData();
formData.append('message', 'hello');
fetch('http://localhost:3000/api/ai/generate', {
  method: 'POST',
  body: formData
}).then(res => res.text()).then(console.log).catch(console.error);
