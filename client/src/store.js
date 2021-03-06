import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import router from './router';

let production = !window.location.host.includes('localhost')
let baseURL = production ? 'https://flipflashcards.herokuapp.com/' : '//localhost:3000/'

let auth = axios.create({
  baseURL: baseURL + "auth",
  withCredentials: true,
  timeout: 3000
})

let api = axios.create({
  baseURL: baseURL + "api",
  withCredentials: true,
  timeout: 3000
})

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: {},
    myDecks: [],
    activeDeck: {
      rating: []
    },
    publicDecks: [],
    searchedDecks: [],
    keyword: '',
    summary: {
      wrong: []
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setMyDecks(state, myDecks) {
      state.myDecks = myDecks
    },
    setActiveDeck(state, activeDeck) {
      state.activeDeck = activeDeck
    },
    setPublicDecks(state, publicDecks) {
      state.publicDecks = publicDecks
    },
    addCardToDeck(state, card) {
      state.activeDeck.cards.push(card)
    },
    setSummary(state, summary) {
      state.summary = summary
    },
    setActiveDeckCard(state, wrong) {
      state.activeDeck.cards = wrong
    },
    setSearchDecks(state, keyword) {
      state.keyword = keyword
      let re = new RegExp(keyword, 'i')
      state.searchedDecks = state.publicDecks.filter(deck => (re.test(deck.title) || re.test(deck.tags) || re.test(deck.description)))
    }
  },
  actions: {
    // AUTH
    login({ commit, dispatch }, creds) {
      auth.post('login', creds)
        .then(res => {
          commit('setUser', res.data)
          dispatch('getMyDecks')
          router.push({ name: "myDecks" })
        })
        .catch(err => console.log("Cannot Login"))
    },
    register({ commit, dispatch }, newUser) {
      auth.post('register', newUser)
        .then(res => {
          commit('setUser', res.data)
          dispatch('getMyDecks')
          router.push({ name: "myDecks" })
        })
        .catch(err => console.log('Cannot Register'))
    },
    authenticate({ commit, dispatch }) {
      auth.get('authenticate')
        .then(res => {
          commit('setUser', res.data)
          dispatch('getMyDecks')
          router.push({ name: "myDecks" })
        })
        .catch(err => {
          console.log('Cannot Authenticate')
          router.push({ name: 'home' })
        })
    },
    logout({ commit, dispatch }) {
      auth.delete('logout')
        .then(res => {
          console.log(res.data)
          commit('setUser', {})
          console.log('user logged out')
          router.push({ name: 'home' })
        })
        .catch(err => console.log('Cannot Logout'))
    },
    // MY DECKS -- EDIT
    getMyDecks({ commit, dispatch }) {
      api.get('/decks/mydecks')
        .then(res => {
          commit('setMyDecks', res.data)
        })
        .catch(err => console.log('Cannot get mydecks'))
    },
    deleteDeck({ commit, dispatch }, deckId) {
      api.delete('/decks/' + deckId)
        .then(res => {
          dispatch('getMyDecks')
          router.push({ name: 'myDecks' })
        })
    },
    getActiveDeck({ commit, dispatch }, deckId) {
      api.get('/decks/' + deckId)
        .then(res => {
          commit('setActiveDeck', res.data)
          router.push({ name: 'deck', params: { deckId: deckId } })
        })
        .catch(err => console.log('Cannot get deck by ID'))
    },
    editDeck({ commit, dispatch }, payload) {
      api.put('/decks/' + payload.deckId, payload.deck)
        .then(res => {
          dispatch('getActiveDeck', payload.deckId)
          dispatch('getMyDecks')
        })
        .catch(err => console.log('Cannot edit deck'))
    },
    //CARD STUFF
    addCard({ commit, dispatch }, payload) {
      api.post('/cards/', payload)
        .then(res => {
          commit('addCardToDeck', res.data)
        })
        .catch(err => console.log('Cannot add new card'))
    },
    removeCard({ commit, dispatch }, payload) {
      api.delete('/cards/' + payload.cardId)
        .then(res => {
          dispatch('getActiveDeck', payload.deckId)
        })
    },
    editCard({ commit, dispatch }, payload) {
      api.put('/cards/' + payload.cardId, payload)
        .then(res => {
          dispatch('getActiveDeck', payload.deckId)
        })
    },
    //GET PUBLIC DECK
    getpublicDecks({ commit, dispatch }) {
      api.get('/decks/public')
        .then(res => {
          commit("setPublicDecks", res.data)
        })
        .catch(err => console.log('Cannot get public decks'))
    },
    addDeck({ commit, dispatch }) {
      let blankDeck = {
        title: 'New Deck Title',
        description: 'New Deck Description',
        tags: ' ',
        color: '#FFFFFF'
      }
      api.post('/decks', blankDeck)
        .then(res => {
          commit('setActiveDeck', res.data)
          router.push({ name: 'deck', params: { deckId: res.data._id } })
        })
    },
    copyDeck({ commit, dispatch }, payload) {
      api.post('/decks/copy', payload.copyDeck)
        .then(res => {
          dispatch('getMyDecks')
          router.push({ name: payload.routeTo })
        })
    },
    //DECKS -- PUBLIC

    //STUDY VIEW
    getStudyView({ commit }, deckId) {
      api.get('/decks/' + deckId)
        .then(res => {
          commit('setActiveDeck', res.data)
          router.push({ name: 'study', params: { deckId: deckId } })
        })
        .catch(err => console.log('Cannot get deck by ID'))
    },
    getStudyViewReverse({ commit }, deckId) {
      api.get('/decks/' + deckId)
        .then(res => {
          let deck = res.data
          for (let i = 0; i < deck.cards.length; i++) {
            let front = deck.cards[i].back;
            let back = deck.cards[i].front;
            deck.cards[i].back = back;
            deck.cards[i].front = front;
          }
          commit('setActiveDeck', deck)
          router.push({ name: 'study', params: { deckId: deckId } })
        })
        .catch(err => console.log('Cannot get deck by ID'))
    },
    goToSummary({ commit }, summary) {
      commit('setSummary', summary)
      router.push({ name: 'summary' })
    },
    postSummary({ commit }, summary) {
      api.put('/decks/' + summary.deckId, summary)
        .then(res => { })
    },
    playAgainX({ commit }, wrong) {
      commit('setActiveDeckCard', wrong)
      router.push({ name: 'study' })
    },
    search({ commit }, keyword) {
      commit('setSearchDecks', keyword)
      router.push({ name: 'searched-decks' })
    },
    rate({ commit }, rating) {
      api.post('/decks/review/' + rating.deckId, rating)
        .then(rating => {
          console.log(rating)
        })
    },
    updateRate({ commit }, rating) {
      api.put('/decks/review/' + rating.deckId, rating)
        .then(rating => {
          console.log("rating update", rating)
        })
    }
  }
})
