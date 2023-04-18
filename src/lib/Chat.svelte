<script lang="ts">
  import { onMount, tick } from "svelte";
  import { io } from "socket.io-client";
  import { currentUser } from "./pocketbase";
  import Emojis from "./Emojis.svelte";
  const socket = io("https://mikael.software", { path: "/socket.io" });

  let inputMessage = "";
  let messages: string[] = [];
  let messageContainer;
  async function scrollToLatestMessage() {
    await tick(); // Wait for the DOM to update
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  onMount(() => {
    socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("chat message", async (msg) => {
      messages = [...messages, msg];
      await scrollToLatestMessage();
    });
  });

  function sendMessage() {
    if (inputMessage.trim()) {
      socket.emit("chat message", {
        user: $currentUser.username,
        message: inputMessage,
      });
      inputMessage = "";
    }
  }
</script>

<div class="chat">
  <ul class="messages" bind:this={messageContainer}>
    {#each messages as message, i (i)}
      {#if message.user === $currentUser.username}
        <li>
          <strong style="color:green">{message.user}:</strong>
          {message.message}
        </li>
      {:else}
        <li><strong>{message.user}:</strong> {message.message}</li>
      {/if}
    {/each}
  </ul>
  <div class="input-area">
    <input
      type="text"
      bind:value={inputMessage}
      placeholder="Type your message"
      on:keydown={(e) => e.key === "Enter" && sendMessage()}
    />
    <button class="button-74" on:click={sendMessage}>Send</button>
  </div>
</div>

<style>
  .chat {
    display: flex;
    flex-direction: column;
    height: 50vh;
  }

  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    list-style: none;
    border: thin solid gray;
    background-color: aliceblue;
  }
  .messages::-webkit-scrollbar {
    width: 10px;
    margin: 1px;
  }

  .messages::-webkit-scrollbar-track {
    background: rgb(255, 255, 255);
    margin: 1px;
  }

  .messages::-webkit-scrollbar-thumb {
    background-color: rgb(119, 119, 119);
    border-radius: 20px;
  }

  .input-area {
    display: flex;
    padding: 0;
    margin-left: 0;
  }

  input {
    flex: 1;
    margin-right: 1px;
    font-size: larger;
    margin-left: 0;
  }

  /* CSS */
  .button-74 {
    background-color: #ffffff;
    border: 2px solid #000000;
    border-radius: 30px;
    box-shadow: #000000 4px 4px 0 0;
    color: #000000;
    cursor: pointer;
    display: inline-block;
    font-weight: 600;
    font-size: 18px;
    padding: 0 18px;
    line-height: 50px;
    text-align: center;
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
  }

  .button-74:hover {
    background-color: rgb(255, 255, 255);
  }

  .button-74:active {
    box-shadow: #422800 2px 2px 0 0;
    transform: translate(2px, 2px);
  }

  @media (min-width: 768px) {
    .button-74 {
      min-width: 120px;
      padding: 0 25px;
    }
  }
</style>
