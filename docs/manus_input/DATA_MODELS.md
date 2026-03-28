# Datenmodelle

## User
- id
- email
- name
- sourceLanguage
- targetLanguage = de
- level
- createdAt
- settings

## Settings
- fontSizeLevel
- darkMode
- notificationsEnabled
- preferredVoice
- reduceMotion
- offlineModeEnabled

## Word
- id
- sourceText
- german
- article
- ipa
- partOfSpeech
- category
- difficulty
- examples[]
- tags[]
- audioUrl optional

## UserWordState
- wordId
- nextReview
- intervalDays
- easeFactor
- repetitions
- lapses
- lastResult
- accuracy
- pronunciationScore optional
- updatedAt

## GrammarLesson
- id
- level
- title
- topic
- explanation
- examples[]
- quiz[]

## SentenceChallenge
- id
- level
- topic
- prompt
- fragments[]
- solution[]
- explanation
- points

## ConversationScenario
- id
- title
- level
- context
- goals[]
- starterMessage
- suggestedReplies[]

## SessionLog
- id
- type: learn | review | speak | grammar | sentence | exam | conversation
- startedAt
- endedAt
- score
- accuracy
- itemsCompleted

## Achievement
- id
- title
- description
- unlockedAt
