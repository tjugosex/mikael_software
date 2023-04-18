<script lang="ts">
  import { onMount } from "svelte";
  import { currentUser, pb } from "./pocketbase";
  const field: boolean[][] = [];

  let CELL_SIZE = 5;
  const FIELD_SIZE = 200;
  let currentScale = 1;

  for (let i = 0; i < FIELD_SIZE; i++) {
    field[i] = [];
    for (let j = 0; j < FIELD_SIZE; j++) {
      field[i][j] = false;
    }
  }

  async function Createpixel(row: number, col: number) {
    try {
      const positionint = row * FIELD_SIZE + col;
      const data = {
        owner: $currentUser.id,
        color: selectedColor,
        position: positionint,
        ownerusername: $currentUser.username,
      };
      let existingPixel;
      try {
        existingPixel = await pb
          .collection("pixels")
          .getFirstListItem(`position=${positionint}`);
      } catch (error) {
        if (error.status === 404) {
          console.log(
            `Pixel at position ${positionint} not found, creating new pixel...`
          );
        } else {
          throw error;
        }
      }
      if (existingPixel) {
        const updatedPixel = await pb
          .collection("pixels")
          .update(existingPixel.id, data);
        console.log("Pixel updated:", updatedPixel);
      } else {
        const createdPixel = await pb.collection("pixels").create(data);
        console.log("Pixel created:", createdPixel);
        const { position, color } = createdPixel;
        const newRow = Math.floor(position / FIELD_SIZE);
        const newCol = position % FIELD_SIZE;
        field[newRow][newCol] = true;
        pixelDict[position] = { color }; 
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = color;
        ctx.fillRect(
          newCol * CELL_SIZE,
          newRow * CELL_SIZE,
          CELL_SIZE,
          CELL_SIZE
        );
      }
    } catch (err) {
      console.error(err);
      console.log("Error status:", err.status);
      console.log("Error data:", err.data);
    }
  }
  const pixelDict = {};
  let lastUpdate = Date.now();
  async function updatePixels() {
    try {
      let currentPage = 1;
      let fetchedItems;
      let totalItems = 0;

      do {
        const updatedPixels = await pb
          .collection("pixels")
          .getList(currentPage, 500, {
            filter: `updated>=${lastUpdate}`,
          });

        fetchedItems = updatedPixels.items.length;
        totalItems += fetchedItems;

        updatedPixels.items.forEach((pixel) => {
          const { position, color, owner } = pixel;
          const row = Math.floor(position / FIELD_SIZE);
          const col = position % FIELD_SIZE;
          field[row][col] = true;
          pixelDict[position] = { color, ownerId: owner };
        });

        currentPage += 1;
      } while (fetchedItems === 500);

      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");

      for (let i = 0; i < FIELD_SIZE; i++) {
        for (let j = 0; j < FIELD_SIZE; j++) {
          const position = i * FIELD_SIZE + j;
          const pixel = pixelDict[position];
          if (pixel && field[i][j]) {

            ctx.fillStyle = pixel.color;
            ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            field[i][j] = false; 
          }
        }
      }


      lastUpdate = Date.now(); 
    } catch (err) {
      console.error(err);
    }
  }

  async function handleClick(row: number, col: number) {
    const position = row * FIELD_SIZE + col;
    const pixel = pixelDict[position];

    if (selectedColor === "#Nocolor" && pixel) {
      if (pixel.ownerId != $currentUser.id) {
        const userRecord = await pb.collection("users").getOne($currentUser.id);
        const userClicked = await pb.collection("users").getOne(pixel.ownerId);
        const gavePointsDate = new Date(userRecord.gavepoints);
        const oneMinuteAgo = new Date(Date.now() - 1000 * 60);

        if (gavePointsDate < oneMinuteAgo) {
          const connectedPixelsCount = countConnectedPixels(
            row,
            col,
            pixel.ownerId,
            new Set()
          );
          const { username, id } = userClicked;
          await pb.collection("users").update($currentUser.id, {
            gavepoints: new Date().toISOString(),
          });
          try {
            const data = {
              usergiver: $currentUser.id,
              userreciever: id,
              pointsgiven: connectedPixelsCount,
            };
            const record = await pb.collection("pointshistory").create(data);
          } catch {
            console.log(
              "something with ph went wrong",
              $currentUser.username,
              " ",
              username,
              " ",
              connectedPixelsCount
            );
          }
          updateUserPoints(pixel.ownerId, connectedPixelsCount);
          console.log("Connected pixels count:", connectedPixelsCount);
          alert(`Added ${connectedPixelsCount} points to ${username}`);
        } else {
          console.log("Wait at least an minute before giving points again");
          alert("Wait at least an minute before giving points again");
        }
        return;
      } else {
        console.log("Your own pixels");
        alert("You can't give points to your own pixels");
      }
    } else if (selectedColor != "#Nocolor") {
      field[row][col] = true;

      Createpixel(row, col);
      const canvas = document.getElementById("canvas") as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = selectedColor;
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }

  async function updateUserPoints(userId: string, pointsToAdd: number) {
    try {
      const userRecord = await pb.collection("users").getOne(userId);

      const updatedPoints = (userRecord.points || 0) + pointsToAdd;

      const updatedUser = await pb.collection("users").update(userId, {
        points: updatedPoints,
      });

      console.log("Updated user points:", updatedUser);
    } catch (error) {
      console.error("Error updating user points:", error);
    }
  }

  let colors = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#F28C28",
    "#808080",
    "#Nocolor",
  ];
  let selectedColor = colors[0];
  const selectColor = (color: string) => {
    selectedColor = color;
  };

  let tooltipX = -500;
  let tooltipY = -500;

  function hideTooltip() {
    tooltipX = -500;
    tooltipY = -500;
  }
  function drawHoverBorder(row, col, ctx) {
    ctx.strokeStyle = "#888888";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      col * CELL_SIZE + 0.5,
      row * CELL_SIZE + 0.5,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    );
  }

  function clearHoverBorder(row, col, ctx) {
    const position = row * FIELD_SIZE + col;
    const pixel = pixelDict[position];

    if (pixel) {
      ctx.fillStyle = pixel.color;
    } else {
      ctx.fillStyle = "white";
    }

    ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }

  let interval: NodeJS.Timeout;

  function countConnectedPixels(
    row: number,
    col: number,
    ownerId: string,
    visited: Set<string>
  ): number {
    const position = row * FIELD_SIZE + col;
    if (
      row < 0 ||
      col < 0 ||
      row >= FIELD_SIZE ||
      col >= FIELD_SIZE ||
      visited.has(position.toString()) ||
      !pixelDict[position] ||
      pixelDict[position].ownerId !== ownerId
    ) {
      return 0;
    }

    visited.add(position.toString());
    let count = 1;

    count += countConnectedPixels(row - 1, col, ownerId, visited);
    count += countConnectedPixels(row + 1, col, ownerId, visited);
    count += countConnectedPixels(row, col - 1, ownerId, visited);
    count += countConnectedPixels(row, col + 1, ownerId, visited);

    // Add diagonal directions
    count += countConnectedPixels(row - 1, col - 1, ownerId, visited);
    count += countConnectedPixels(row - 1, col + 1, ownerId, visited);
    count += countConnectedPixels(row + 1, col - 1, ownerId, visited);
    count += countConnectedPixels(row + 1, col + 1, ownerId, visited);

    return count;
  }

  async function getPixelData(row: number, col: number) {
    const positionint = row * FIELD_SIZE + col;
    try {
      const pixel = await pb
        .collection("pixels")
        .getFirstListItem(`position=${positionint}`);
      return pixel;
    } catch (error) {
      if (error.status === 404) {
        return null;
      } else {
        throw error;
      }
    }
  }
  function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

  let divname = "",
    divcreated = "",
    xp = 0,
    yp = 0;

  onMount(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    canvas.width = CELL_SIZE * FIELD_SIZE;
    canvas.height = CELL_SIZE * FIELD_SIZE;

    // Set the initial background to white
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updatePixels();
    interval = setInterval(updatePixels, 5000);

    canvas.addEventListener("click", (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);
      handleClick(row, col);
    });

    let lastHoveredRow = -1;
    let lastHoveredCol = -1;

    canvas.addEventListener("mousemove", async (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const col = Math.floor(x / CELL_SIZE);
      const row = Math.floor(y / CELL_SIZE);

      function updateTooltipPosition() {
        tooltipX = event.clientX + 10;
        tooltipY = event.clientY + 10;
      }

      function hideTooltip() {
        tooltipX = -500;
        tooltipY = -500;
      }

      if (row !== lastHoveredRow || col !== lastHoveredCol) {
        if (lastHoveredRow !== -1 && lastHoveredCol !== -1) {
          clearHoverBorder(lastHoveredRow, lastHoveredCol, ctx);
        }
        drawHoverBorder(row, col, ctx);

        lastHoveredRow = row;
        lastHoveredCol = col;

        const pixelData = await getPixelData(row, col);
        if (pixelData) {
          updateTooltipPosition();
          const { updated, ownerusername, position } = pixelData;
          yp = Math.floor(position / FIELD_SIZE);
          xp = position % FIELD_SIZE;
          if (ownerusername == "") {
            divname = "Unknown user";
          } else {
            divname = ownerusername;
          }

          divcreated = formatDateTime(updated);
        } else {
          console.log("No pixel data found.");
          hideTooltip();
        }
      }
    });

    canvas.addEventListener("mouseout", () => {
      hideTooltip();
      if (lastHoveredRow !== -1 && lastHoveredCol !== -1) {
        clearHoverBorder(lastHoveredRow, lastHoveredCol, ctx);
      }
      lastHoveredRow = -1;
      lastHoveredCol = -1;
    });
  });
</script>

<div class="tooltip" style="top: {tooltipY}px; left: {tooltipX}px;">
  <p>Owner of pixel: {divname}<br />Date: {divcreated}<br /> X: {xp} Y: {yp}</p>
</div>

<div class="canvasborder">
  <div class="color-picker" id="color-picker">
    {#each colors as color}
      {#if color == "#Nocolor"}
        <p style="margin-left: 4px" />
      {/if}
      <div
        class="color-picker-square"
        style="background-color: {color}; position: relative;"
        on:click={() => selectColor(color)}
        class:selected={selectedColor === color}
      >
        {#if color == "#Nocolor"}
          <p
            style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: 0; pointer-events: none;"
          >
            👍
          </p>
        {/if}
      </div>
    {/each}
  </div>
  <canvas id="canvas" />
</div>

<style></style>
