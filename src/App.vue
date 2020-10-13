<template>
  <div id="app">
    
    <header>
      <nav>
        <router-link to="/schedule">График</router-link>
        <router-link to="/cleaners">Уборщицы</router-link>
      </nav>
    </header>
    
    <router-view></router-view>
  
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      
    }
  }
}
</script>