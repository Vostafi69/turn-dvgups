require("../libs/ion.sound");

ion.sound({
  sounds: [
    {
      name: "add-peer",
    },
    {
      name: "remove-peer",
    },
    {
      name: "alert",
    },
    {
      name: "message",
      volume: 0.2,
    },
    {
      name: "start",
      volume: 0.2,
    },
    {
      name: "stop",
      volume: 0.2,
    },
    {
      name: "hand-up",
    },
  ],
  volume: 0.5,
  path: "sounds/",
  preload: true,
});

export default ion;
