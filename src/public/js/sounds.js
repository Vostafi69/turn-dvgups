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
  ],
  volume: 0.5,
  path: "sounds/",
  preload: true,
});

export default ion;
