#!/usr/bin/env node
/**
 * Sube un trabajo entero (resultado final, proceso y texto) a la página.
 *
 *   npm run subir -- "C:\ruta\a\la\carpeta"
 *
 * 1. La primera vez, si la carpeta no tiene proyecto.json, lo arma solo
 *    (lo que diga "boceto", "sketch", "wip" o "proceso" va a Proceso) y se
 *    detiene para que lo revises.
 * 2. La segunda vez lee proyecto.json (y texto.md si existe), te pide la
 *    contraseña del admin y sube todo. Se puede correr las veces que haga
 *    falta: los archivos que ya están arriba no se vuelven a subir.
 *
 * Lee la URL y la anon key de .env.local (no las muestra). Entra con tu
 * usuario de admin, igual que el panel, así que respeta las mismas reglas.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline'
import { spawnSync } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MAX_BYTES = 50 * 1024 * 1024
const SITE = 'https://nicolas-colombo-portfolio.nicoandres-colombo.workers.dev'
const MEDIA_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.webm', '.mp4'])
const PROCESS_WORDS = /(boceto|sketch|wip|proceso|rough|lineart|animatic|storyboard)/i

// ---------- utilidades ----------

function loadEnv() {
  const file = path.join(ROOT, '.env.local')
  if (!fs.existsSync(file)) fail('No encuentro .env.local en la carpeta del proyecto.')
  const env = {}
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    fail('.env.local no tiene NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }
  return env
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`)
  process.exit(1)
}

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function safeFileName(name) {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9.\-_]/gi, '_')
}

function mediaType(name) {
  const ext = path.extname(name).toLowerCase()
  if (ext === '.gif') return 'gif'
  if (ext === '.webm' || ext === '.mp4') return 'video'
  return 'image'
}

function mime(name) {
  return (
    {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.webm': 'video/webm',
      '.mp4': 'video/mp4',
    }[path.extname(name).toLowerCase()] || 'application/octet-stream'
  )
}

/** Ancho y alto de PNG, GIF y JPEG leyendo la cabecera; de video, con ffprobe si está instalado */
function dimensions(buf, name, full) {
  const ext = path.extname(name).toLowerCase()
  try {
    if (ext === '.webm' || ext === '.mp4') {
      const r = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', full], { encoding: 'utf8' })
      const [w, h] = (r.stdout || '').trim().split(',').map(Number)
      return w && h ? { width: w, height: h } : null
    }
    if (ext === '.png') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
    if (ext === '.gif') return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) }
    if (ext === '.jpg' || ext === '.jpeg') {
      let i = 2
      while (i < buf.length) {
        if (buf[i] !== 0xff) return null
        const marker = buf[i + 1]
        const len = buf.readUInt16BE(i + 2)
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
        }
        i += 2 + len
      }
    }
  } catch {}
  return null
}

/** Nombre legible a partir del archivo: "caminataboceto2.gif" → "caminataboceto2" */
function prettyName(file) {
  return path.basename(file, path.extname(file)).replace(/[-_]+/g, ' ').replace(/0{3,}\d*$/, '').trim()
}

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s)
        else if (!/\r?\n/.test(s)) rl.output.write('*')
        else rl.output.write(s)
      }
    }
    rl.question(question, (answer) => {
      rl.close()
      if (hidden) process.stdout.write('\n')
      resolve(answer.trim())
    })
  })
}

// ---------- 1. armar proyecto.json si no existe ----------

function draftManifest(dir) {
  const files = fs
    .readdirSync(dir)
    .filter((f) => MEDIA_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es'))

  const finals = files.filter((f) => !PROCESS_WORDS.test(f))
  const process_ = files.filter((f) => PROCESS_WORDS.test(f))

  // "Ueda2boceto.png" → busca un final que se llame parecido ("ueda2.png")
  const base = (f) => path.basename(f, path.extname(f)).toLowerCase().replace(PROCESS_WORDS, '').replace(/[^a-z]/g, '')
  const finalBase = new Map(finals.map((f) => [base(f), f]))

  const title = path.basename(path.dirname(path.resolve(dir))) || path.basename(dir)
  return {
    titulo: title,
    slug: slugify(title),
    estado: 'draft',
    descripcion: '',
    link: '',
    portada: finals.find((f) => mediaType(f) === 'image') || finals[0] || '',
    // En el orden de la página. "boceto_de": el final que se muestra junto a
    // ese boceto (y no se repite). "vista_previa": se reproduce en la home.
    piezas: [
      ...finals.map((f) => ({ archivo: f, epigrafe: '' })),
      ...process_.map((f) => {
        const pair = finalBase.get(base(f))
        return { archivo: f, epigrafe: '', ...(pair ? { boceto_de: pair } : {}) }
      }),
    ],
  }
}

// ---------- 2. subir ----------

async function main() {
  const dir = process.argv.slice(2).find((a) => !a.startsWith('--'))
  if (!dir) fail('Falta la carpeta. Uso: npm run subir -- "C:\\ruta\\a\\la\\carpeta"')
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) fail(`No existe la carpeta: ${dir}`)

  const manifestPath = path.join(dir, 'proyecto.json')
  if (!fs.existsSync(manifestPath)) {
    const draft = draftManifest(dir)
    fs.writeFileSync(manifestPath, JSON.stringify(draft, null, 2) + '\n', 'utf8')
    console.log(`\nArmé ${manifestPath}`)
    console.log(`  ${draft.piezas.length} piezas.`)
    console.log('Revisalo (título, orden, epígrafes, qué boceto va con qué final) y volvé a correr el mismo comando.')
    console.log('Si querés un texto largo sobre el proyecto, ponelo en texto.md en la misma carpeta.\n')
    return
  }

  let m
  try {
    // Sin la marca BOM que agregan algunos editores de Windows
    m = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^﻿/, ''))
  } catch (e) {
    fail(`proyecto.json tiene un error de formato: ${e.message}`)
  }
  if (!m.titulo) fail('proyecto.json necesita "titulo".')
  const slug = m.slug || slugify(m.titulo)
  const textoPath = path.join(dir, 'texto.md')
  // texto.md: se ignoran la línea "BORRADOR…" y los párrafos [entre corchetes] sin completar
  const body = (fs.existsSync(textoPath) ? fs.readFileSync(textoPath, 'utf8') : m.texto || '')
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^BORRADOR/i.test(p) && !/^\[[\s\S]*\]$/.test(p))
    .join('\n\n')

  // "piezas": lista única en el orden de la página. (Se siguen aceptando las
  // listas viejas "final" y "proceso".) Lo que es boceto va como proceso.
  const items = m.piezas
    ? m.piezas.map((it) => ({
        ...it,
        section: it.seccion === 'proceso' || it.boceto_de || PROCESS_WORDS.test(it.archivo || '') ? 'process' : 'final',
      }))
    : [
        ...(m.final || []).map((it) => ({ ...it, section: 'final' })),
        ...(m.proceso || []).map((it) => ({ ...it, section: 'process' })),
      ]
  const cleanUp = process.argv.includes('--limpiar')
  for (const it of items) {
    const p = path.join(dir, it.archivo || '')
    if (!it.archivo || !fs.existsSync(p)) fail(`No encuentro el archivo "${it.archivo}" en la carpeta.`)
    const size = fs.statSync(p).size
    if (size > MAX_BYTES) fail(`${it.archivo} pesa ${(size / 1048576).toFixed(1)} MB; el máximo es 50 MB.`)
  }

  const env = loadEnv()
  // Con SUPABASE_SERVICE_ROLE_KEY en .env.local no pide contraseña (esa key
  // tiene acceso total: solo en .env.local, que no se sube a GitHub).
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceKey || env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: !serviceKey },
  })

  console.log(`\nSubir "${m.titulo}" (${items.length} archivos) a la página.`)
  if (serviceKey) {
    console.log('Usando la service role key de .env.local (sin contraseña).')
  } else {
    const email = (await ask('Email del admin: ')) || fail('Falta el email.')
    const password = await ask('Contraseña (no se muestra): ', { hidden: true })
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) fail(`No pude entrar: ${authError.message}`)
  }

  // ¿La base ya tiene la migración 004?
  const probe = await supabase.from('project_media').select('id, section, caption, pair_id').limit(1)
  if (probe.error) {
    fail('Falta correr supabase/migrations/004_project_process.sql en Supabase → SQL Editor.')
  }
  const probe5 = await supabase.from('project_media').select('id, preview').limit(1)
  if (probe5.error) {
    fail('Falta correr supabase/migrations/005_preview_and_link.sql en Supabase → SQL Editor.')
  }

  // Proyecto: crear o actualizar por slug
  const fields = {
    title: m.titulo,
    slug,
    description: m.descripcion || null,
    body: body || null,
    link_url: m.link || null,
    project_type: m.tipo === 'gif_sequence' ? 'gif_sequence' : 'individual',
    status: m.estado === 'published' ? 'published' : 'draft',
  }
  const { data: existing } = await supabase.from('projects').select('id').eq('slug', slug).maybeSingle()
  let projectId = existing?.id
  if (projectId) {
    const { error } = await supabase.from('projects').update(fields).eq('id', projectId)
    if (error) fail(`No pude actualizar el proyecto: ${error.message}`)
    console.log(`✓ Proyecto actualizado (${slug})`)
  } else {
    const { data: max } = await supabase.from('projects').select('sort_order').order('sort_order', { ascending: false }).limit(1)
    const { data, error } = await supabase
      .from('projects')
      .insert({ ...fields, sort_order: (max?.[0]?.sort_order ?? -1) + 1 })
      .select('id')
      .single()
    if (error) fail(`No pude crear el proyecto: ${error.message}`)
    projectId = data.id
    console.log(`✓ Proyecto creado (${slug})`)
  }

  const { data: currentMedia } = await supabase.from('project_media').select('*').eq('project_id', projectId)
  const byFile = new Map()
  for (const row of currentMedia || []) {
    const url = row.storage_path || row.external_url || ''
    const name = decodeURIComponent(url.split('/').pop() || '').replace(/^\d+-/, '')
    if (name) byFile.set(name, row)
  }
  // El panel viejo cambiaba tildes y ñ por "_" (diseño → dise_o): reconocer esos también
  const oldStyle = (f) => f.replace(/[^a-z0-9.\-_]/gi, '_')

  // Subir archivos que falten y ordenar todo
  const idByFile = new Map()
  const urlByFile = new Map()
  let order = 0
  for (const it of items) {
    const file = it.archivo
    const safe = safeFileName(file)
    const full = path.join(dir, file)
    const row = byFile.get(safe) || byFile.get(oldStyle(file))
    const common = {
      section: it.section,
      caption: it.epigrafe || null,
      alt_text: it.alt || prettyName(file),
      sort_order: order++,
      preview: !!it.vista_previa,
    }

    if (row) {
      const fix = row.media_type === 'webm' ? { media_type: 'video' } : {}
      if (!row.width || !row.height) {
        const size = dimensions(fs.readFileSync(full), file, full)
        if (size) Object.assign(fix, size)
      }
      const { error } = await supabase.from('project_media').update({ ...common, ...fix }).eq('id', row.id)
      if (error) fail(`No pude actualizar ${file}: ${error.message}`)
      idByFile.set(file, row.id)
      urlByFile.set(file, row.storage_path || row.external_url)
      console.log(`  = ${file} (ya estaba)`)
      continue
    }

    const buf = fs.readFileSync(full)
    const storagePath = `${projectId}/${Date.now()}-${safe}`
    process.stdout.write(`  ↑ ${file} (${(buf.length / 1048576).toFixed(1)} MB)… `)
    const { error: upError } = await supabase.storage.from('projects').upload(storagePath, buf, {
      contentType: mime(file),
      cacheControl: '31536000',
      upsert: false,
    })
    if (upError) {
      console.log('')
      fail(`Storage rechazó ${file}: ${upError.message}`)
    }
    const url = supabase.storage.from('projects').getPublicUrl(storagePath).data.publicUrl
    const size = dimensions(buf, file, full)
    const { data: inserted, error } = await supabase
      .from('project_media')
      .insert({
        project_id: projectId,
        media_type: mediaType(file),
        storage_path: url,
        width: size?.width ?? null,
        height: size?.height ?? null,
        ...common,
      })
      .select('id')
      .single()
    if (error) {
      console.log('')
      fail(`No pude guardar ${file} en la base: ${error.message}`)
    }
    idByFile.set(file, inserted.id)
    urlByFile.set(file, url)
    console.log('listo')
  }

  // Bocetos ↔ finales
  for (const it of items) {
    if (it.section !== 'process') continue
    const pairId = it.boceto_de ? idByFile.get(it.boceto_de) : null
    if (it.boceto_de && !pairId) console.warn(`  ! "${it.boceto_de}" (boceto_de de ${it.archivo}) no está en "final"`)
    await supabase.from('project_media').update({ pair_id: pairId || null }).eq('id', idByFile.get(it.archivo))
  }

  // Portada
  const cover = m.portada ? urlByFile.get(m.portada) : null
  if (m.portada && !cover) console.warn(`  ! La portada "${m.portada}" no está en la lista de archivos`)
  if (cover) await supabase.from('projects').update({ cover_url: cover }).eq('id', projectId)

  const extra = (currentMedia || []).filter((r) => ![...idByFile.values()].includes(r.id))
  if (extra.length && cleanUp) {
    for (const r of extra) {
      const url = r.storage_path || r.external_url || ''
      const name = decodeURIComponent(url.split('/').pop() || '').replace(/^\d+-/, '')
      await supabase.from('project_media').delete().eq('id', r.id)
      const marker = '/object/public/projects/'
      const at = url.indexOf(marker)
      if (at !== -1) {
        await supabase.storage.from('projects').remove([decodeURIComponent(url.slice(at + marker.length))])
      }
      console.log(`  − ${name || r.media_type} (borrado: no está en proyecto.json)`)
    }
  } else if (extra.length) {
    console.log(`\n  ${extra.length} archivo(s) que ya estaban en el proyecto no figuran en proyecto.json; los dejé.`)
    console.log('  Para borrarlos, corré el mismo comando agregando --limpiar al final.')
  }

  if (!serviceKey) await supabase.auth.signOut()
  console.log(`\n✓ Listo. ${fields.status === 'draft' ? 'Quedó como borrador: solo lo ves logueado.' : 'Publicado.'}`)
  console.log(`  Página: ${SITE}/project/${slug}`)
  console.log(`  Local:  http://localhost:3000/project/${slug}`)
  console.log(`  Admin:  ${SITE}/admin/projects/${projectId}\n`)
}

main().catch((e) => fail(e?.message || String(e)))
