    const HIDE_ANIMATION_MS = 280;
    const SHOW_ANIMATION_MS = 320;

    const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]'));
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const toggleCompletedButton = document.getElementById('toggle-completed');
    const hoverSkillPreviews = document.querySelectorAll('.hover-skill-preview[data-preview-src]');
    const clickVideoTriggers = document.querySelectorAll('.click-video-trigger[data-video-src]');

    let hideCompleted = false;

    function enhanceHoverSkillPreviews() {
      hoverSkillPreviews.forEach(preview => {
        if (preview.querySelector('.hover-skill-preview__popup')) return;

        const previewSize = Number.parseInt(preview.dataset.previewSize || '64', 10);
        const popup = document.createElement('span');
        popup.className = 'hover-skill-preview__popup';
        popup.setAttribute('aria-hidden', 'true');

        const image = document.createElement('img');
        image.src = preview.dataset.previewSrc;
        image.alt = preview.dataset.previewAlt || `${preview.textContent.trim()} icon preview`;
        image.loading = 'lazy';
        image.width = previewSize;
        image.height = previewSize;
        image.style.width = `${previewSize}px`;
        image.style.height = `${previewSize}px`;
        popup.appendChild(image);

        preview.appendChild(popup);
      });
    }

    function setupClickVideoPreviews() {
      clickVideoTriggers.forEach(trigger => {
        if (trigger.querySelector('.click-video-popup')) return;

        const previewSize = Number.parseInt(trigger.dataset.videoSize || '300', 10);

        const popup = document.createElement('span');
        popup.className = 'click-video-popup';

        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'click-video-popup__close';
        closeButton.setAttribute('aria-label', 'Close video');
        closeButton.textContent = 'X';

        const video = document.createElement('video');
        video.src = trigger.dataset.videoSrc;
        video.controls = true;
        video.preload = 'metadata';
        video.playsInline = true;
        video.style.width = `${previewSize}px`;
        video.style.height = `${previewSize}px`;

        popup.append(closeButton, video);
        trigger.appendChild(popup);

        function closePopup() {
          popup.classList.remove('is-open');
          video.pause();
        }

        function togglePopup(event) {
          event.preventDefault();
          event.stopPropagation();

          const isOpen = popup.classList.toggle('is-open');
          if (isOpen) {
            video.currentTime = 0;
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }

        trigger.addEventListener('click', togglePopup);
        trigger.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            togglePopup(event);
          }
        });

        closeButton.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          closePopup();
        });

        popup.addEventListener('click', event => {
          event.stopPropagation();
        });
      });
    }

    function setToggleState() {
      if (!toggleCompletedButton) return;

      toggleCompletedButton.classList.toggle('is-active', hideCompleted);
      toggleCompletedButton.setAttribute('aria-pressed', String(hideCompleted));
      toggleCompletedButton.textContent = hideCompleted ? 'Show completed' : 'Hide completed';
    }

    function animateHide(item) {
      if (!item || item.classList.contains('is-hidden')) return;

      item.classList.add('is-collapsing');
      window.setTimeout(() => {
        item.classList.add('is-hidden');
        item.classList.remove('is-collapsing');
      }, HIDE_ANIMATION_MS);
    }

    function animateShow(item) {
      if (!item) return;

      item.classList.remove('is-hidden', 'is-collapsing');
      item.style.opacity = '0';
      item.style.transform = 'translateY(-8px) scale(0.985)';
      item.style.maxHeight = '0px';

      requestAnimationFrame(() => {
        item.style.maxHeight = `${item.scrollHeight + 40}px`;
        item.style.opacity = '1';
        item.style.transform = 'translateY(0) scale(1)';
      });

      window.setTimeout(() => {
        item.style.maxHeight = '';
        item.style.opacity = '';
        item.style.transform = '';
      }, SHOW_ANIMATION_MS);
    }

    function applyCompletedVisibility(animated) {
      checkboxes.forEach(box => {
        const item = box.closest('.check-item');
        if (!item) return;

        const shouldHide = hideCompleted && box.checked;
        if (!shouldHide) {
          if (item.classList.contains('is-hidden') && animated) {
            animateShow(item);
          } else {
            item.classList.remove('is-hidden', 'is-collapsing');
          }
          return;
        }

        if (animated) {
          animateHide(item);
        } else {
          item.classList.add('is-hidden');
          item.classList.remove('is-collapsing');
        }
      });

      setToggleState();
    }

    function updateProgress(animated = true) {
      const checked = checkboxes.filter(box => box.checked).length;
      const total = checkboxes.length;
      const percentage = total ? (checked / total) * 100 : 0;

      if (progressFill) progressFill.style.width = `${percentage}%`;
      if (progressText) progressText.textContent = `${checked} / ${total} done`;

      checkboxes.forEach(box => {
        box.closest('.check-item')?.classList.toggle('done', box.checked);
      });

      applyCompletedVisibility(animated);
    }

    enhanceHoverSkillPreviews();
    setupClickVideoPreviews();
    checkboxes.forEach(box => box.addEventListener('change', () => updateProgress(true)));

    if (toggleCompletedButton) {
      toggleCompletedButton.addEventListener('click', () => {
        hideCompleted = !hideCompleted;
        applyCompletedVisibility(true);
      });
    }

    updateProgress(false);
