// ChatScreen.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';

const tarotDeck = [
  {
    name: 'The Fool',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg',
    meaning: 'New beginnings, optimism, trust in life',
  },
  {
    name: 'The Magician',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg',
    meaning: 'Action, the power to manifest',
  },
  {
    name: 'The High Priestess',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/88/RWS_Tarot_02_High_Priestess.jpg',
    meaning: 'Inaction, going within, the subconscious',
  },
  {
    name: 'The Empress',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d2/RWS_Tarot_03_Empress.jpg',
    meaning: 'Abundance, nurturing, fertility, life in bloom!',
  },
  {
    name: 'The Emperor',
    image: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/RWS_Tarot_04_Emperor.jpg',
    meaning: 'Structure, stability, rules and power',
  },
  {
    name: 'The Hierophant',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/RWS_Tarot_05_Hierophant.jpg',
    meaning: 'Institutions, tradition, society and its rules',
  },
  {
    name: 'The Lovers',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/TheLovers.jpg',
    meaning: 'Sexuality, passion, choice, uniting',
  },
  {
    name: 'The Chariot',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/RWS_Tarot_07_Chariot.jpg',
    meaning: 'Movement, progress, integration',
  },
  {
    name: 'Strength',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f5/RWS_Tarot_08_Strength.jpg',
    meaning: 'Courage, subtle power, integration of animal self',
  },
  {
    name: 'The Hermit',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/RWS_Tarot_09_Hermit.jpg',
    meaning: 'Meditation, solitude, consciousness',
  },
  {
    name: 'Wheel of Fortune',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg',
    meaning: 'Cycles, change, ups and downs',
  },
  {
    name: 'Justice',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/RWS_Tarot_11_Justice.jpg',
    meaning: 'Fairness, equality, balance',
  },
  {
    name: 'The Hanged Man',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/RWS_Tarot_12_Hanged_Man.jpg',
    meaning: 'Surrender, new perspective, enlightenment',
  },
  {
    name: 'Death',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/RWS_Tarot_13_Death.jpg',
    meaning: 'The end of something, change, the impermeability of all things',
  },
  {
    name: 'Temperance',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/RWS_Tarot_14_Temperance.jpg',
    meaning: 'Balance, moderation, being sensible',
  },
  {
    name: 'The Devil',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/55/RWS_Tarot_15_Devil.jpg',
    meaning: 'Destructive patterns, addiction, giving away your power',
  },
  {
    name: 'The Tower',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/53/RWS_Tarot_16_Tower.jpg',
    meaning: 'Collapse of stable structures, release, sudden insight',
  },
  {
    name: 'The Star',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg',
    meaning: 'Hope, calm, a good omen!',
  },
  {
    name: 'The Moon',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg',
    meaning: 'Mystery, the subconscious, dreams',
  },
  {
    name: 'The Sun',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg',
    meaning: 'Success, happiness, all will be well',
  },
  {
    name: 'Judgement',
    image: 'https://upload.wikimedia.org/wikipedia/commons/d/dd/RWS_Tarot_20_Judgement.jpg',
    meaning: 'Rebirth, a new phase, inner calling',
  },
  {
    name: 'The World',
    image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg',
    meaning: 'Completion, wholeness, attainment, celebration of life',
  },
];

export default tarotDeck;
