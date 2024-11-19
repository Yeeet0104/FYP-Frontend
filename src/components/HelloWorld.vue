<template>
  <div>
    <h1>Vue.js + Node.js Integration</h1>
    <p>{{ message }}</p>
    <p> hio hio </p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: "",
    };
  },
  async mounted() {
    const response = await fetch("http://localhost:3000/api/data");
    const data = await response.json();
    this.message = data.message;
  },
  
};
</script>
