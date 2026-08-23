import type { Story } from "cyoa-core";

/**
 * A small demo story showing off cyoa-core's variables, onEnter effects, choice
 * effects, gated choices (a plain condition and a `contains` check), and multiple
 * endings.
 */
export const lighthouseStory: Story = {
  id: "the-lighthouse",
  title: "The Lighthouse",
  startNodeId: "shore",
  initialVariables: { trust: 0, inventory: [] },
  nodes: {
    shore: {
      id: "shore",
      content:
        "Your boat scrapes onto the rocky shore of Emberly Island. Fog swallows the lighthouse ahead, its lamp dark.",
      choices: [
        { text: "Search the tide pools", target: "tide_pools" },
        { text: "Head straight for the lighthouse", target: "door" },
      ],
    },
    tide_pools: {
      id: "tide_pools",
      content: "Among the rocks you find a rusted lantern, still holding a spark of oil.",
      onEnter: ["inventory.push('lantern')"],
      choices: [{ text: "Continue to the lighthouse", target: "door" }],
    },
    door: {
      id: "door",
      content:
        "The lighthouse door is shut fast against the wind. A narrow side path curves around back through the fog.",
      choices: [
        { text: "Knock", target: "knock" },
        {
          text: "Follow the side path",
          target: "side_door",
          condition: "inventory contains 'lantern'",
        },
      ],
    },
    knock: {
      id: "knock",
      content: "The door creaks open. An old keeper eyes you warily, hand on his cane.",
      choices: [
        { text: "Tell him you're a shipwrecked sailor", target: "lamp_room", effects: ["trust += 2"] },
        { text: "Claim to be a lighthouse inspector", target: "lamp_room", effects: ["trust -= 1"] },
      ],
    },
    side_door: {
      id: "side_door",
      content: "By lantern light you spot a half-hidden service door and slip inside, unseen.",
      onEnter: ["trust -= 1"],
      choices: [{ text: "Climb to the lamp room", target: "lamp_room" }],
    },
    lamp_room: {
      id: "lamp_room",
      content:
        "The lamp room hums with light at the top of the stairs. The keeper is already there, watching you climb.",
      choices: [
        {
          text: "Ask him about the wrecks below the cliffs",
          target: "ending_truth",
          condition: "trust >= 2",
        },
        {
          text: "Offer to help him tend the light tonight",
          target: "ending_keeper",
          condition: "trust >= 0",
        },
        { text: "Reach for the lamp's lens while his back is turned", target: "ending_thief" },
      ],
    },
    ending_truth: {
      id: "ending_truth",
      content:
        "He tells you everything — the wrecks, the wreckers, the years of silence he's kept. Come morning, you leave Emberly with the truth, and a friend.",
      choices: [],
    },
    ending_keeper: {
      id: "ending_keeper",
      content:
        "You spend the season as his apprentice, tending the light through every storm. It isn't the life you planned, but it's a good one.",
      choices: [],
    },
    ending_thief: {
      id: "ending_thief",
      content:
        "Your fingers close on the lens — and the keeper's cane finds your knuckles first. You're thrown out into the fog, empty-handed.",
      choices: [],
    },
  },
};
