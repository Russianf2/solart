/* ============================================
   SOLARTECH ANDINA S.A.S. — Main Script
   Santa Marta, Colombia
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     1. NAVBAR
     ============================================ */
  const navbar = document.querySelector('.navbar')
  const toggle = document.querySelector('.nav-toggle')
  const navLinks = document.querySelector('.nav-links')

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active')
      navLinks.classList.toggle('open')
    })

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active')
        navLinks.classList.remove('open')
      })
    })
  }

  let lastScroll = 0
  window.addEventListener('scroll', () => {
    const sy = window.scrollY
    if (sy > 50) {
      navbar.classList.add('scrolled')
    } else {
      navbar.classList.remove('scrolled')
    }
    lastScroll = sy
  }, { passive: true })

  /* ============================================
     2. SCROLL REVEAL (IntersectionObserver)
     ============================================ */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0
        setTimeout(() => entry.target.classList.add('visible'), delay)
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  revealEls.forEach(el => observer.observe(el))

  /* ============================================
     3. STATS COUNTER
     ============================================ */
  function animateCounter(el, target, suffix = '', duration = 2000) {
    const start = performance.now()
    const isFloat = target % 1 !== 0

    function update(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * target

      if (isFloat) {
        el.textContent = current.toFixed(1) + suffix
      } else {
        el.textContent = Math.floor(current).toLocaleString('es-CO') + suffix
      }

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        if (isFloat) {
          el.textContent = target.toFixed(1) + suffix
        } else {
          el.textContent = target.toLocaleString('es-CO') + suffix
        }
      }
    }

    requestAnimationFrame(update)
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        const target = parseFloat(el.dataset.target)
        const suffix = el.dataset.suffix || ''
        animateCounter(el, target, suffix)
        statsObserver.unobserve(el)
      }
    })
  }, { threshold: 0.5 })

  document.querySelectorAll('.stat-number').forEach(el => statsObserver.observe(el))

  /* ============================================
     4. SOLAR CALCULATOR
     ============================================ */
  const calcConsumo = document.getElementById('calc-consumo')
  const calcTipo = document.getElementById('calc-tipo')
  const calcBtn = document.getElementById('calc-btn')
  const calcPlaceholder = document.getElementById('calc-placeholder')
  const calcResult = document.getElementById('calc-result')
  const calcValPaneles = document.getElementById('calc-val-paneles')
  const calcValAhorro = document.getElementById('calc-val-ahorro')
  const calcValCO2 = document.getElementById('calc-val-co2')
  const calcValCosto = document.getElementById('calc-val-costo')

  const tarifas = {
    residencial: 850,
    comercial: 950,
    industrial: 780
  }

  function calcular() {
    const consumo = parseFloat(calcConsumo.value)
    const tipo = calcTipo.value
    if (!consumo || consumo <= 0 || !tipo) {
      calcPlaceholder.style.display = 'flex'
      calcResult.classList.remove('active')
      calcPlaceholder.style.flexDirection = 'column'
      calcPlaceholder.style.alignItems = 'center'
      calcPlaceholder.style.justifyContent = 'center'
      return
    }

    const tarifa = tarifas[tipo] || 850
    const costoActual = consumo * tarifa / 1000
    const factor = tipo === 'residencial' ? 1.2 : tipo === 'comercial' ? 1.0 : 0.85
    const kwhPorPanel = 0.45 * factor
    const paneles = Math.ceil(consumo / (kwhPorPanel * 30))
    const ahorro = costoActual * 0.85
    const co2 = (consumo * 0.42).toFixed(1)

    calcValPaneles.textContent = paneles
    calcValAhorro.textContent = '$' + Math.round(ahorro).toLocaleString('es-CO')
    calcValCO2.textContent = co2
    calcValCosto.textContent = '$' + Math.round(costoActual).toLocaleString('es-CO')

    calcPlaceholder.style.display = 'none'
    calcResult.classList.add('active')
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', calcular)
  }
  if (calcConsumo) {
    calcConsumo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') calcular()
    })
  }

  /* ============================================
     5. QUOTE FORM — Simulación CRM
     ============================================ */
  const form = document.getElementById('quote-form')
  const modalOverlay = document.getElementById('modal-overlay')
  const modalClose = document.getElementById('modal-close')

  function validarCampo(input) {
    const tipo = input.type || input.tagName.toLowerCase()
    const valor = input.value.trim()

    if (input.id === 'form-nombre') {
      return valor.length >= 3
    }
    if (input.id === 'form-telefono') {
      return /^[\d\s+\-()]{7,15}$/.test(valor)
    }
    if (input.id === 'form-email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
    }
    if (input.id === 'form-proyecto') {
      return valor !== ''
    }
    if (input.id === 'form-mensaje') {
      return valor.length >= 10
    }

    return valor !== ''
  }

  function mostrarError(input, valido) {
    if (!valido) {
      input.classList.add('error')
    } else {
      input.classList.remove('error')
    }
  }

  function validarFormulario() {
    let valido = true
    const inputs = form.querySelectorAll('.form-input')

    inputs.forEach(input => {
      const ok = validarCampo(input)
      mostrarError(input, ok)
      if (!ok) valido = false
    })

    return valido
  }

  if (form) {
    form.querySelectorAll('.form-input').forEach(input => {
      input.addEventListener('blur', () => {
        const ok = validarCampo(input)
        mostrarError(input, ok)
      })
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          const ok = validarCampo(input)
          mostrarError(input, ok)
        }
      })
    })

    form.addEventListener('submit', (e) => {
      e.preventDefault()

      if (!validarFormulario()) {
        const firstError = form.querySelector('.form-input.error')
        if (firstError) firstError.focus()
        return
      }

      const btn = form.querySelector('.btn-submit')
      btn.disabled = true
      btn.classList.add('loading')

      const datos = {
        id: 'SOL-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        nombre: document.getElementById('form-nombre').value.trim(),
        telefono: document.getElementById('form-telefono').value.trim(),
        email: document.getElementById('form-email').value.trim(),
        proyecto: document.getElementById('form-proyecto').value,
        mensaje: document.getElementById('form-mensaje').value.trim(),
        fecha: new Date().toISOString(),
        fuente: 'Web-Solartech',
        estado: 'Nuevo'
      }

      console.log('📬 [' + new Date().toLocaleString('es-CO') + '] Nuevo lead registrado en CRM — ID:', datos.id)
      console.log('📋 Datos:', datos)

      try {
        const leads = JSON.parse(localStorage.getItem('solartech_leads') || '[]')
        leads.push(datos)
        localStorage.setItem('solartech_leads', JSON.stringify(leads))
        console.log('✅ Lead almacenado en base de datos (CRM). Total leads:', leads.length)
      } catch (err) {
        console.error('⚠️ Error al almacenar lead:', err)
      }

      setTimeout(() => {
        btn.classList.remove('loading')
        btn.classList.add('sent')
        btn.querySelector('.btn-text').textContent = '¡Enviado!'

        document.getElementById('modal-nombre').textContent = datos.nombre
        document.getElementById('modal-id').textContent = datos.id
        modalOverlay.classList.add('active')

        form.reset()
        form.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'))

        setTimeout(() => {
          btn.classList.remove('sent')
          btn.querySelector('.btn-text').textContent = 'Solicitar cotización'
          btn.disabled = false
        }, 5000)
      }, 1800)
    })
  }

  if (modalClose) {
    modalClose.addEventListener('click', () => {
      modalOverlay.classList.remove('active')
    })
  }
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active')
      }
    })
  }

  /* ============================================
     6. SMOOTH SCROLL (anchor offset)
     ============================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'))
      if (target) {
        e.preventDefault()
        const offset = 80
        const top = target.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    })
  })

  /* ============================================
     7. LOGO ANNUAL YEAR
     ============================================ */
  const yearEl = document.getElementById('footer-year')
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear()
  }

})
