import { useEffect, useRef } from 'react'
import * as pbi from 'powerbi-client'

/**
 * Componente para embebir dashboards de Power BI
 * 
 * @param {Object} props
 * @param {string} props.embedUrl - URL del dashboard de Power BI
 * @param {string} props.accessToken - Token de acceso para el embed
 * @param {string} props.embedId - ID del dashboard/report
 * @param {string} props.embedType - Tipo: 'dashboard' o 'report'
 * @param {Object} props.config - Configuración adicional del embed
 */
const PowerBIEmbed = ({ 
  embedUrl, 
  accessToken, 
  embedId, 
  embedType = 'dashboard',
  config = {} 
}) => {
  const embedContainerRef = useRef(null)
  const powerbiRef = useRef(null)

  useEffect(() => {
    if (!embedUrl || !accessToken || !embedId || !embedContainerRef.current) {
      return
    }

    // Configuración por defecto
    const defaultConfig = {
      type: embedType,
      tokenType: pbi.models.TokenType.Embed,
      accessToken: accessToken,
      embedUrl: embedUrl,
      id: embedId,
      permissions: pbi.models.Permissions.All,
      settings: {
        panes: {
          filters: {
            expanded: false,
            visible: true
          },
          pageNavigation: {
            visible: true
          }
        },
        background: pbi.models.BackgroundType.Transparent,
        ...config.settings
      }
    }

    // Crear instancia de Power BI
    if (!powerbiRef.current) {
      powerbiRef.current = new pbi.service.Service(
        pbi.factories.hpmFactory,
        pbi.factories.wpmpFactory,
        pbi.factories.routerFactory
      )
    }

    // Embed el dashboard/report
    const embedConfig = {
      ...defaultConfig,
      ...config
    }

    const embeddedItem = powerbiRef.current.embed(
      embedContainerRef.current,
      embedConfig
    )

    // Manejar eventos si es necesario
    embeddedItem.off('loaded')
    embeddedItem.on('loaded', () => {
      console.log('Power BI embed cargado correctamente')
    })

    embeddedItem.off('error')
    embeddedItem.on('error', (event) => {
      console.error('Error en Power BI embed:', event.detail)
    })

    // Cleanup
    return () => {
      if (powerbiRef.current && embedContainerRef.current) {
        powerbiRef.current.reset(embedContainerRef.current)
      }
    }
  }, [embedUrl, accessToken, embedId, embedType, config])

  if (!embedUrl || !accessToken || !embedId) {
    return (
      <div className="powerbi-error">
        <p>Error: Faltan parámetros necesarios para cargar el dashboard</p>
      </div>
    )
  }

  return (
    <div className="powerbi-embed-container">
      <div ref={embedContainerRef} className="powerbi-embed" />
    </div>
  )
}

export default PowerBIEmbed


