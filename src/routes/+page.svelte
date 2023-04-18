<script lang="ts">
  import { onMount } from "svelte";

  let innerWidth = 0;
  let innerHeight = 0;
  let x = 0;
  let y = 0;
  let direction = Math.floor(Math.random() * 360);

  function handlexy() {
    let speed = 0.2;
    let angleRadians = (direction * Math.PI) / 180;
    x = x + speed * Math.cos(angleRadians);
    y = y + speed * Math.sin(angleRadians);
    if (x >= innerWidth - 200 || x <= 0) {
      direction = 180 - direction;
    }
    if (y >= innerHeight - 200 || y <= 0) {
      direction = 360 - direction;
    }
  }

  // Check if the environment is not SSR

  onMount(() => {});
</script>

<main>
  <div class="screenfitter">
    <div class="card">
      <ul class="list">
        <li><a href="/pixelgame" class="button">PixelGame</a></li>
        <li><a href="/chat" class="button">Chat</a></li>
        <li><a href="https://flow.mikael.software" class="button">Posting app</a></li>
        <li><a href="https://github.com/tjugosex" class="button">Github</a></li>
      </ul>
    </div>
  </div>
</main>

<style>
  :root {
  }
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    opacity: 1;

    background-size: auto;
    background-color: white;
    font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    color: black;
  }

  .card {
    position: relative;
    width: 400px;
    height: 600px;
    background-color: #eeeeee;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
    z-index: 3;
  }

  .divgradient {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    opacity: 1;
    background-image: linear-gradient(
      to top,
      #fcc5e4 0%,
      #fda34b 15%,
      #ff7882 35%,
      #c8699e 52%,
      #7046aa 71%,
      #0c1db8 87%,
      #020f75 100%
    );
    background-size: cover;
    z-index: 2;
  }
  .divgradient2 {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    opacity: 1;
    background-image: linear-gradient(
      to top,
      #fcc5e4 0%,
      #fda34b 15%,
      #ff7882 35%,
      #c8699e 52%,
      #7046aa 71%,
      #0c1db8 87%,
      #020f75 100%
    );
    background-size: cover;
    z-index: 2;
  }

  .screenfitter {
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .smooth-move {
    transition: transform 0.5s ease;
  }
  .list {
    list-style: none;
  }

  a.button {
    -webkit-appearance: button;
    -moz-appearance: button;
    appearance: button;
    font-size: x-large;
    font-weight: bold;
    text-decoration: none;
    color: initial;
    border-radius: 2px;
    width: 300px;
    height: 100%;
    padding: 2px;
    margin: 5px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  }
  a.button:hover {
    box-shadow: rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,
      rgba(60, 64, 67, 0.15) 0px 2px 6px 2px;
  }
  a.button:active {
    box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset,
      rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;
  }
</style>
