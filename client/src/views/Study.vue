<template class="container">
  <div class="row theRow d-flex justify-content-center">
    <div class="col-12 studyRow pt-1" :class="activeDeck.color">
      <div v-if="hasCards" @click="back = !back" class="flip-card">
        <div :class="{'transition-flip': back}" class="flip-card-inner">
          <div class="flip-card-front justify-content-center d-flex">
            <!-- Front of Card -->
            <div class="card shadow study ">
              <h2 class="cardText card-body h-100 d-flex align-items-center justify-content-center">
                {{activeDeck.cards[(deckPosition)].front}} </h2>
            </div>
          </div>
          <div class="flip-card-back justify-content-center d-flex">
            <!-- Back of Card -->
            <div class="card shadow study d-flex align-middle">
              <h3 v-if="back" id="cardTextBack" class="card-body h-100 d-flex align-items-center justify-content-center">
                {{activeDeck.cards[(deckPosition)].back}} </h3>
              <div v-if="back" class="card-footer d-flex justify-content-around">
                <i class="fas fa-times-circle x-and-check" @click="markWrong()" style="color:  rgb(221, 43, 43)"></i>
                <i class="fas fa-check-circle x-and-check" @click="markRight()" style="color: rgb(38, 211, 38)"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="row">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb" :class="activeDeck.color">
              <li class="breadcrumb-item">
                <router-link :to="{name: 'home'}">Home</router-link>
              </li>
            </ol>
          </nav>
        </div>
        <h3 class="mt-1"> This deck has no cards!</h3>
        <i class="far fa-7x fa-grimace mt-2" style="color: #5a5a5a;"></i>
      </div>
      <!-- felix's restart button -->
      <div v-if="hasCards" class="restartLink">
        <p @click="restartDeck"><strong><u>restart</u></strong></p>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'study',
    data() {
      return {
        back: false,
        deckPosition: 0,
        summaryResults: {
          deckId: "",
          wrong: [],
          right: [],
          score: 0,
          deckTitle: ""
        },
        hasCards: null
      }
    },
    computed: {
      activeDeck() {
        return this.$store.state.activeDeck
      }
    },
    mounted() {
      let cards = this.$store.state.activeDeck.cards
      if (cards.length > 0) {
        this.hasCards = true
        let numCards = cards.length
        let count = 0
        for (let i = cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cards[i], cards[j]] = [cards[j], cards[i]];
        }
      } else {
        this.hasCards = false
      }
    },
    methods: {
      markWrong() {
        // this.$store.dispatch('sendWrong', this)
        this.summaryResults.wrong.push(this.activeDeck.cards[this.deckPosition])
        this.nextCard()
      },
      markRight() {
        this.summaryResults.right.push(this.activeDeck.cards[this.deckPosition])
        this.nextCard()
      },
      nextCard() {
        if (this.activeDeck.cards.length > this.deckPosition + 1) {
          this.deckPosition++
        } else {
          this.summaryResults.score = Math.round((this.summaryResults.right.length / this.activeDeck.cards.length) * 100)
          this.summaryResults.deckId = this.activeDeck._id
          this.summaryResults.deckTitle = this.activeDeck.title
          this.$store.dispatch('goToSummary', this.summaryResults)
        }
      },
      restartDeck() {
        this.deckPosition = 0
      },
      resizeFont() {

      }
    }
  }

</script>

<style scoped>
  .container {
    margin: -10px;
  }
</style>

<style>
  .study {
    height: 90%;
    width: 90%;
    display: table;
    margin-left: 20px;
    margin-top: 15px;
  }

  .studyRow {
    width: 100vw;
    height: 90vh;
    display: block;
    /* justify-content: center; */
  }

  @media screen and (max-height: 500px) {
    .studyRow {
      height: 100vh;
    }
  }


  .theRow {
    height: 90vh !important;
    /* width: 100vw !important; */
    /* padding: -10px; */
    /* margin: -10px; */
  }

  .body {
    height: 94vh;

  }

  .flip-card {
    width: 96vw;
    height: 100%;
    perspective: 1000px;
  }

  .flip-card-inner {
    transition: transform 1.5s;
    transform-style: preserve-3d;
  }

  .transition-flip {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    width: 96vw;
    height: 94vh;
    backface-visibility: hidden;
  }

  .flip-card-front {
    z-index: 2;
  }

  .flip-card-back {
    /* background-color: #2980b9; */
    transform: rotateY(180deg);
    z-index: 1;
  }

  .x-and-check {
    font-size: 30px;
  }

  .restartLink {
    display: flex;
    justify-content: center;
    color: gray;
  }
</style>