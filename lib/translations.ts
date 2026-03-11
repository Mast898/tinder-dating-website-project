// lib/translations.ts
export const translations = {
    ru: {
      // Главная страница
      landing: {
        title: 'Flame',
        subtitle: 'Найдите идеальную пару рядом с вами',
        features: {
          swipe: {
            title: 'Свайпай и находи совпадения',
            desc: 'Лайкай профили и получай матчи мгновенно'
          },
          chat: {
            title: 'Общайся в реальном времени',
            desc: 'Пиши своим матчам приватно'
          },
          discovery: {
            title: 'Умный подбор',
            desc: 'Находи людей по интересам'
          }
        },
        createAccount: 'Создать аккаунт',
        signIn: 'Войти'
      },
  
      // Авторизация
      auth: {
        loginTitle: 'Войдите чтобы найти идеальную пару',
        signUpTitle: 'Создайте аккаунт',
        email: 'Email',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        signIn: 'Войти',
        signUp: 'Зарегистрироваться',
        noAccount: 'Нет аккаунта?',
        haveAccount: 'Уже есть аккаунт?',
        forgotPassword: 'Забыли пароль?',
        orContinueWith: 'Или продолжить с'
      },
  
      // Навигация
      nav: {
        discover: 'Поиск',
        matches: 'Матчи',
        chat: 'Чат',
        profile: 'Профиль'
      },
  
      // Discover
      discover: {
        title: 'Поиск',
        noProfiles: 'Больше нет профилей',
        noProfilesDesc: 'Загляните позже — рядом могут появиться новые люди',
        loading: 'Загрузка...',
        distance: 'км от вас'
      },
  
      // Matches
      matches: {
        title: 'Ваши матчи',
        noMatches: 'Пока нет матчей',
        noMatchesDesc: 'Продолжайте свайпать — ваш матч уже близко!',
        newMatch: 'Новый матч!'
      },
  
      // Chat
      chat: {
        title: 'Сообщения',
        noChats: 'Нет сообщений',
        noChatsDesc: 'Начните общение с вашим матчем',
        typeMessage: 'Напишите сообщение...',
        send: 'Отправить'
      },
  
      // Profile
      profile: {
        title: 'Профиль',
        editProfile: 'Редактировать',
        settings: 'Настройки',
        signOut: 'Выйти',
        name: 'Имя',
        age: 'Возраст',
        bio: 'О себе',
        photos: 'Фото',
        interests: 'Интересы',
        location: 'Местоположение',
        joinDate: 'Присоединился'
      },
  
      // Общие
      common: {
        loading: 'Загрузка...',
        error: 'Ошибка',
        success: 'Успешно',
        cancel: 'Отмена',
        save: 'Сохранить',
        delete: 'Удалить',
        confirm: 'Подтвердить',
        close: 'Закрыть',
        back: 'Назад',
        next: 'Далее',
        previous: 'Назад'
      },
  
      // Ошибки
      errors: {
        required: 'Обязательное поле',
        invalidEmail: 'Неверный email',
        passwordTooShort: 'Пароль слишком короткий',
        passwordsDontMatch: 'Пароли не совпадают',
        networkError: 'Ошибка сети',
        unauthorized: 'Не авторизован',
        serverError: 'Ошибка сервера'
      },
  
      // Уведомления
      notifications: {
        newLike: 'Вам поставили лайк!',
        newMatch: 'У вас новый матч!',
        newMessage: 'Новое сообщение'
      }
    }
  }
  
  export type Language = keyof typeof translations
  export type TranslationKey = keyof typeof translations.ru
  
  export function t(lang: Language = 'ru', key: TranslationKey | string): string {
    const keys = key.split('.')
    let value: any = translations[lang]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    return value || key
  }