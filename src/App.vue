<template>
  <div id="app">
    
    <header>
      <nav class="navbar navbar-expand navbar-light bg-light">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/schedule">График</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/cleaners">Уборщицы</router-link>
          </li>
        </ul>
        
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