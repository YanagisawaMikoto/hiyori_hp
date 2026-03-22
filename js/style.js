// ハンバーガーメニューの開閉
    const menuBtn = document.getElementById('menuBtn');
    const closeBtn = document.getElementById('closeBtn');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const overlay = hamburgerMenu.querySelector('.hamburger-menu__overlay');

    // メニューを開く
    menuBtn.addEventListener('click', () => {
      hamburgerMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden'; // スクロール防止
    });

    // メニューを閉じる関数
    const closeMenu = () => {
      hamburgerMenu.classList.remove('is-open');
      document.body.style.overflow = ''; // スクロール復帰
    };

    // 閉じるボタンをクリック
    closeBtn.addEventListener('click', closeMenu);

    // オーバーレイをクリック
    overlay.addEventListener('click', closeMenu);

    // メニューリンクをクリックしたら閉じる
    const menuLinks = hamburgerMenu.querySelectorAll('.hamburger-menu__link, .hamburger-menu__reserve-btn');
    menuLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });

 // js/style.js の最後に追加

/* ========================================
   Conceptセクション - スクロールアニメーション
======================================== */
document.addEventListener('DOMContentLoaded', function() {
  const conceptItems = document.querySelectorAll('.concept__item');
  
  if (conceptItems.length === 0) return;
  
  // IntersectionObserver のオプション
  const observerOptions = {
    root: null, // ビューポートを基準
    rootMargin: '-100px 0px', // 少し余裕を持たせて発火
    threshold: 0.2 // 20%見えたら発火
  };
  
  // IntersectionObserver のコールバック
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 画面内に入ったら is-visible クラスを追加
        entry.target.classList.add('is-visible');
        
        // 一度アニメーションしたら監視を解除（再度アニメーションさせたい場合はコメントアウト）
        observer.unobserve(entry.target);
      }
    });
  };
  
  // Observer を作成
  const observer = new IntersectionObserver(observerCallback, observerOptions);
  
  // 各 concept__item を監視
  conceptItems.forEach(item => {
    observer.observe(item);
  });
});


/* ========================================
   StyleGallery スライダー - 無限ループアニメーション
======================================== */
document.addEventListener('DOMContentLoaded', function() {
  // ★ 要素の取得
  const slider = document.querySelector('.style-gallery__slider');
  const list = document.querySelector('.style-gallery__list');
  const items = document.querySelectorAll('.style-gallery__item');
  const prevBtn = document.querySelector('.style-gallery__arrow--prev');
  const nextBtn = document.querySelector('.style-gallery__arrow--next');
  
  // ★ 要素が存在しない場合は処理を中断
  if (!slider || !list || items.length === 0) return;
  
  // ★ 変数の初期化
  const itemCount = items.length; // オリジナルアイテム数
  let currentIndex = 0; // 現在のスライド位置
  let autoPlayTimer = null; // 自動再生タイマー
  let isAutoPlaying = true; // 自動再生フラグ
  let touchStartX = 0; // タッチ開始位置
  let touchEndX = 0; // タッチ終了位置
  let isDragging = false; // ドラッグ中フラグ
  let scrollTimer = null; // スクロール検知用タイマー
  
  // ★ デバイス判定（モバイル: < 1024px、PC: >= 1024px）
  const isMobile = () => window.innerWidth < 1024;
  
  // ★ アイテムの幅 + gap を計算
  const getItemWidth = () => {
    const item = items[0];
    const width = item.offsetWidth; // アイテムの幅
    const gap = isMobile() ? 20 : 40; // gapの値（モバイル: 20px、PC: 40px）
    return width + gap;
  };
  
  /* ========================================
     無限ループ用のアイテム複製
  ======================================== */
  const cloneItems = () => {
    if (!isMobile()) {
      // ★ PC版: 3つ表示するため、前後に3つずつ複製
      const firstClone = items[0].cloneNode(true);
      const secondClone = items[1].cloneNode(true);
      const thirdClone = items[2].cloneNode(true);
      const lastClone = items[itemCount - 1].cloneNode(true);
      const secondLastClone = items[itemCount - 2].cloneNode(true);
      const thirdLastClone = items[itemCount - 3].cloneNode(true);
      
      // ★ 後ろに最初の3つを複製
      list.appendChild(firstClone);
      list.appendChild(secondClone);
      list.appendChild(thirdClone);
      
      // ★ 前に最後の3つを複製
      list.insertBefore(lastClone, list.firstChild);
      list.insertBefore(secondLastClone, list.firstChild);
      list.insertBefore(thirdLastClone, list.firstChild);
    } else {
      // ★ モバイル版: 全アイテムを後ろに複製
      items.forEach(item => {
        const clone = item.cloneNode(true);
        list.appendChild(clone);
      });
    }
  };
  
  // ★ 複製を実行
  cloneItems();
  
  /* ========================================
     スライドの位置を更新
  ======================================== */
  const updatePosition = (smooth = true) => {
    const itemWidth = getItemWidth(); // アイテム幅 + gap
    let offset;
    
    if (isMobile()) {
      // ★ モバイル: 1つ表示（左端揃え）
      offset = -currentIndex * itemWidth;
    } else {
      // ★ PC: 3つ表示（中央揃え）
      // currentIndex + 3（複製分）を考慮し、中央に配置
      offset = -(currentIndex + 3) * itemWidth + (slider.offsetWidth / 2) - (itemWidth / 2);
    }
    
    // ★ トランジションの設定
    list.style.transition = smooth ? 'transform 0.5s ease' : 'none';
    list.style.transform = `translateX(${offset}px)`;
  };
  
  /* ========================================
     次のスライドへ移動
  ======================================== */
  const goToNext = () => {
    currentIndex++;
    updatePosition(true);
    
    // ★ 無限ループ処理: 最後に到達したら最初に戻る
    setTimeout(() => {
      if (currentIndex >= itemCount) {
        currentIndex = 0;
        updatePosition(false); // トランジションなしで即座に移動
      }
    }, 500); // トランジション終了後に実行
  };
  
  /* ========================================
     前のスライドへ移動
  ======================================== */
  const goToPrev = () => {
    currentIndex--;
    updatePosition(true);
    
    // ★ 無限ループ処理: 最初より前に行ったら最後に戻る
    setTimeout(() => {
      if (currentIndex < 0) {
        currentIndex = itemCount - 1;
        updatePosition(false); // トランジションなしで即座に移動
      }
    }, 500); // トランジション終了後に実行
  };
  
  /* ========================================
     自動再生機能
  ======================================== */
  const startAutoPlay = () => {
    if (!isAutoPlaying) return;
    stopAutoPlay(); // 既存のタイマーをクリア
    autoPlayTimer = setInterval(() => {
      goToNext();
    }, 3000); // ★ 3秒ごとに自動スライド
  };
  
  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  };
  
  // ★ 自動再生を一時停止し、3秒後に再開
  const pauseAndResumeAutoPlay = () => {
    isAutoPlaying = false;
    stopAutoPlay();
    
    setTimeout(() => {
      isAutoPlaying = true;
      startAutoPlay();
    }, 3000); // 3秒後に再開
  };
  
  /* ========================================
     スクロールイベント（手動スクロール検知）
  ======================================== */
  slider.addEventListener('scroll', () => {
    stopAutoPlay();
    
    // ★ スクロール停止を検知して自動再生再開
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      pauseAndResumeAutoPlay();
    }, 150);
  });
  
  /* ========================================
     タッチイベント（モバイル用スワイプ検知）
  ======================================== */
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
    stopAutoPlay(); // タッチ開始時に自動再生停止
  }, { passive: true });
  
  slider.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    touchEndX = e.touches[0].clientX;
  }, { passive: true });
  
  slider.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;
    
    // スワイプ距離を計算
    const swipeDistance = touchStartX - touchEndX;
    const threshold = 50; // 50px以上スワイプしたら反応
    
    if (Math.abs(swipeDistance) > threshold) {
      if (swipeDistance > 0) {
        // 左にスワイプ → 次へ
        goToNext();
      } else {
        // 右にスワイプ → 前へ
        goToPrev();
      }
    }
    
    // スワイプ終了後に自動再生再開
    pauseAndResumeAutoPlay();
    
    // リセット
    touchStartX = 0;
    touchEndX = 0;
  });
  
  /* ========================================
     ウィンドウリサイズ対応
  ======================================== */
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      updatePosition(false); // リサイズ後に位置を再計算
    }, 100);
  });
  
  /* ========================================
     初期化処理
  ======================================== */
  // ★ 初期表示位置を設定
  updatePosition(false);
  
  // ★ 自動再生開始
  startAutoPlay();
  
  /* ========================================
     ページ離脱時の自動再生停止
  ======================================== */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoPlay(); // タブが非表示になったら停止
    } else {
      if (isAutoPlaying) {
        startAutoPlay(); // タブが表示されたら再開
      }
    }
  });
});

// Q&Aアコーディオン機能
document.addEventListener('DOMContentLoaded', function() {
  const qaItems = document.querySelectorAll('.qa__item');
  
  qaItems.forEach(item => {
    const question = item.querySelector('.qa__question');
    const answer = item.querySelector('.qa__answer');
    
    question.addEventListener('click', () => {
      // 現在の開閉状態を取得
      const isOpen = item.classList.contains('is-open');
      
      // 全てのアイテムを閉じる（アコーディオン型の場合）
      // ※複数開きたい場合はこの3行をコメントアウト
      // qaItems.forEach(otherItem => {
      //   otherItem.classList.remove('is-open');
      // });
      
      // クリックしたアイテムの開閉を切り替え
      if (isOpen) {
        item.classList.remove('is-open');
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });
});

// js/style.js の最後に追加

/* ========================================
   桜の花びらアニメーション
======================================== */
document.addEventListener('DOMContentLoaded', function() {
  const sakuraContainer = document.getElementById('sakuraContainer');
  
  if (!sakuraContainer) return;
  
  // 花びらを生成する関数
  function createSakuraPetal() {
    const petal = document.createElement('div');
    petal.classList.add('sakura-petal');
    
    // ランダムな初期位置（横方向）
    const startX = Math.random() * window.innerWidth;
    petal.style.left = `${startX}px`;
    
    // ランダムなサイズ（20px〜40px）
    const size = Math.random() * 30 + 80;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    
    // ランダムな落下速度（8秒〜15秒）
    const duration = Math.random() * 0.1 + 15;
    petal.style.animationDuration = `${duration}s`;
    
    // ランダムな横揺れ距離
    const swayDistance = Math.random() * 100 + 50;
    petal.style.setProperty('--sway-x', `${swayDistance}px`);
    
    // コンテナに追加
    sakuraContainer.appendChild(petal);
    
    // アニメーション終了後に削除
    setTimeout(() => {
      petal.remove();
    }, (duration + delay) * 1000);
  }
  
  // 初期花びらを生成（1個）
  for (let i = 0; i < 1; i++) {
    setTimeout(() => {
      createSakuraPetal();
    }, i * 300); // 0.3秒ごとに生成
  }

});