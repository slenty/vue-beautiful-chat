<template>
  <div id="home" :style="{background: backgroundColor}">
    <!-- HELLO WORLD -->
    <div style="text-align: center; padding-top: 30px">
      <el-form :inline="false">
        <el-form-item>
          <el-tag class="world-setting-tag" v-for="(label, key) in worldSettingTag" :key="key" :value="key" :label="label" @click="handleDefaultWorld(label)">{{key}}</el-tag>
        </el-form-item>

        <el-form-item>
          <el-input style="width: 50%" v-model="prompt" type="textarea" rows="6" :placeholder="worldPlaceholder"></el-input>
        </el-form-item>
       <div style="font-size: 20px; margin-top: -10px; margin-bottom: 50px"> World Setting</div>

       <el-form-item>
         <beautiful-chat
        :always-scroll-to-bottom="alwaysScrollToBottom"
        :close="closeChat"
        :colors="colors"
        :is-open="isChatOpen"
        :message-list="messageList"
        title="WizardVerse"
        :message-styling="messageStyling"
        :new-messages-count="newMessagesCount"
        :on-message-was-sent="onMessageWasSent"
        :open="openChat"
        :participants="participants"
        :show-close-button="false"
        :show-launcher="false"
        :show-emoji="false"
        :show-file="false"
        :show-typing-indicator="showTypingIndicator"
        :show-edition="true"
        :show-deletion="true"
        :title-image-url="titleImageUrl"
        :disable-user-list-toggle="true"
        @onType="handleOnType"
        @edit="editMessage"
        @remove="removeMessage"
      >
        <template v-slot:text-message-toolbox="scopedProps">
          <button
            v-if="!scopedProps.me && scopedProps.message.type === 'text'"
            @click.prevent="like(scopedProps.message.id)"
          >
            👍
          </button>
        </template>
        <template v-slot:text-message-body="scopedProps">
          <p class="sc-message--text-content" v-html="scopedProps.messageText"></p>
          <p
            v-if="scopedProps.message.data.meta"
            class="sc-message--meta"
            :style="{color: scopedProps.messageColors.color}"
          >
            {{ scopedProps.message.data.meta }}
          </p>
          <p
            v-if="scopedProps.message.isEdited || scopedProps.message.liked"
            class="sc-message--edited"
          >
            <template v-if="scopedProps.message.isEdited">✎</template>
            <template v-if="scopedProps.message.liked">👍</template>
          </p>
        </template>
        <template v-slot:system-message-body="{message}"> [System]: {{ message.text }} </template>
    </beautiful-chat>
      </el-form-item>
    </el-form>
    </div>
    <!-- <TestArea
      :chosen-color="chosenColor"
      :colors="colors"
      :message-styling="messageStyling"
      :on-message="sendMessage"
      :on-typing="handleTyping"
    /> -->
  </div>
</template>

<script>
import axios from 'axios'
import messageHistory from '../../messageHistory'
import chatParticipants from '../../chatProfiles'
import Header from '../../Header.vue'
import Footer from '../../Footer.vue'
import TestArea from '../../TestArea.vue'
import availableColors from '../../colors'
import titleImageUrl from '../../assets/WizardLM.png'
import { worldSettingTag, worldPlaceholder } from '../../config/index'

export default {
  name: 'Server',
  components: {
    Header,
    Footer,
    TestArea
  },
  data() {
    return {
      participants: chatParticipants,
      titleImageUrl: titleImageUrl,
      messageList: messageHistory,
      newMessagesCount: 0,
      isChatOpen: true,
      showTypingIndicator: '',
      colors: null,
      availableColors,
      chosenColor: 'null',
      alwaysScrollToBottom: true,
      messageStyling: true,
      userIsTyping: false,
      prompt: '',
      worldPlaceholder: worldPlaceholder,
      worldSettingTag: worldSettingTag
    }
  },
  computed: {
    linkColor() {
      return this.chosenColor === 'dark' ? this.colors.sentMessage.text : this.colors.launcher.bg
    },
    backgroundColor() {
      return this.chosenColor === 'dark' ? this.colors.messageList.bg : '#fff'
    }
  },
  created() {
    this.setColor('blue')
    console.log('worldSettingTag=====', worldSettingTag)
  },
  mounted() {
    this.messageList.forEach((x) => (x.liked = false))
    // this.getTestApi()
  },
  methods: {
    /**
     * 1. 联调一轮对话。字段对齐, 调通接口
     * 2. 联调多轮对话。这个需要每轮对话的标识
     * 3. 联调图片
     * 4. 前端部署
     * 
     * todo： 
     * 1.空文本也可让用户发送
     * 2. 服务器返回文本对齐，左对齐
     */
    getTextApi (message) {
      let historyList = []
      for(let i = 1 ; i < this.messageList.length - 1; i++ ){
        let item = this.messageList[i]
        let itemNext = this.messageList[i+1]
        if(item.author == 'me' &&  itemNext.author == 'support') {
          historyList.push({USER: item.data.text == '😄' ? '' : item.data.text, ASSISTANT: itemNext.data.text})
        }
      }
      let params = {
        system_prompt: this.prompt,
        USER: message.data.text == '😄' ? '' : message.data.text,
        history: historyList
      }
      console.log('用户输入=================', params)
      axios
        .post('https://v.api.aa1.cn/api/yiyan/index.php', params)
        .then(res => {
          console.log('获取到文本数据=================', res)
           this.handleTyping('')
           this.sendMessage(res.data.ASSISTANT) // 参数是后端返回的数据文本，大概需要经过一些处理
           this.getImageApi(res.data.ASSISTANT) // 获取后端返回的文本
        })
    },

    /**
     * 此处调用ai图片接口，接口参数为文本接口返回的服务器回复
     * 因为ai图片接口太慢了，所以另起一个接口
     */
    getImageApi (text) {
       this.handleTyping('testeeet')
       let params = {
        ASSISTANT: text,
        system_prompt: this.prompt
      }
      console.log('调用图片接口===================', params)

      axios
        .post('https://api.thecatapi.com/v1/images/search?limit=1', params)
        .then(res => {
          console.log('获取到图片数据=================', res)
          let imageUrl = res.data.path // 获取后端返回的图片url
          this.handleTyping('')
          // debugger          
          if(res.data) {
             this.sendMessage(text, imageUrl)
          }
        })
    },

    sendMessage(text, url) {
      if (text) {
        this.newMessagesCount = this.isChatOpen ? this.newMessagesCount : this.newMessagesCount + 1
        this.onMessageWasSent({
          author: 'support',
          type: url ? 'file' : 'text',
          id: Math.random(),
          data: {text: url ? '' : text, file: {url: url}}
        })
      }
    },
    handleTyping(text) {
      this.showTypingIndicator =
        text.length > 0 ? this.participants[this.participants.length - 1].id : ''
    },
    onMessageWasSent(message) {
       if(!this.prompt) {
        this.$message.warning('Plese write the World Setting')
        return
      }
      if(this.showTypingIndicator) {
        this.$message.warning('Wait a second, the server is responding...')
        return
      }
      // debugger
      console.log('message...', message)
      this.messageList = [...this.messageList, Object.assign({}, message, {id: Math.random()})]
      if(message.author == 'me') {
         this.handleTyping('testeeet')
         this.getTextApi(message)
      }
     
      // setTimeout(() => {
      //   this.getTestApi()
      //   this.sendMessage('我是服务器回复...啦啦啦啦啦')
      // }, 5000);
    },
    openChat() {
      this.isChatOpen = true
      this.newMessagesCount = 0
    },
    closeChat() {
      this.isChatOpen = false
    },
    setColor(color) {
      this.colors = this.availableColors[color]
      this.chosenColor = color
    },
    showStylingInfo() {
      this.$modal.show('dialog', {
        title: 'Info',
        text:
          'You can use *word* to <strong>boldify</strong>, /word/ to <em>emphasize</em>, _word_ to <u>underline</u>, `code` to <code>write = code;</code>, ~this~ to <del>delete</del> and ^sup^ or ¡sub¡ to write <sup>sup</sup> and <sub>sub</sub>'
      })
    },
    messageStylingToggled(e) {
      this.messageStyling = e.target.checked
    },
    handleOnType() {
      this.$root.$emit('onType')
      this.userIsTyping = true
    },
    editMessage(message) {
      const m = this.messageList.find((m) => m.id === message.id)
      m.isEdited = true
      m.data.text = message.data.text
    },
    removeMessage(message) {
      if (confirm('Delete?')) {
        const m = this.messageList.find((m) => m.id === message.id)
        m.type = 'system'
        m.data.text = 'This message has been removed'
      }
    },
    like(id) {
      const m = this.messageList.findIndex((m) => m.id === id)
      var msg = this.messageList[m]
      msg.liked = !msg.liked
      this.$set(this.messageList, m, msg)
    },

    handleDefaultWorld(world) {
      this.prompt = world
    }
  }
}
</script>

<style>

.world-setting-tag {
  cursor: pointer;
  margin-right: 10px;
}
body {
  padding: 0px;
  margin: 0px;
}

#home {
  background: #f5f5f5 url('http://coffcer.github.io/vue-chat/dist/images/bg.jpg') no-repeat center;
  background-size: cover;
}



* {
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
}

.demo-description {
  max-width: 500px;
}

.demo-description img {
  max-width: 500px;
}

.demo-test-area {
  width: 300px;
  box-sizing: border-box;
}

.demo-test-area--text {
  box-sizing: border-box;
  width: 100%;
  margin: 0px;
  padding: 0px;
  resize: none;
  font-family: Avenir Next, Helvetica Neue, Helvetica, sans-serif;
  background: #fafbfc;
  color: #8da2b5;
  border: 1px solid #dde5ed;
  font-size: 16px;
  padding: 16px 15px 14px;
  margin: 0;
  border-radius: 6px;
  outline: none;
  height: 150px;
  margin-bottom: 10px;
}

.demo-monster-img {
  width: 400px;
  display: block;
  margin: 60px auto;
}

.text-center {
  text-align: center;
}

.colors a {
  color: #fff;
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 10px;
}

.toggle a {
  text-decoration: none;
}

.messageStyling {
  font-size: small;
}
</style>
