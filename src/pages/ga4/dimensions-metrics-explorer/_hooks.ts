import { useSelector } from "react-redux"
import { useMemo, useEffect, useState } from "react"
import { usePersistantObject, usePersistentString } from "../../../hooks"
import { StorageKey } from "../../../constants"

export const useInputs = () => {
  const [search, setSearch] = usePersistentString(
    StorageKey.ga4DimensionsMetricsSearch
  )

  return { search, setSearch }
}

type Dimension = gapi.client.analyticsdata.DimensionMetadata
type Metric = gapi.client.analyticsdata.MetricMetadata

export enum RequestState {
  Loading = "loading",
  Finished = "finished",
  NotStarted = "not-started",
}

// TODO add in a loading state.
type UseDimensionsAndMetrics = (
  propertyId: string
) => {
  dimensions: Dimension[] | undefined
  metrics: Metric[] | undefined
  state: RequestState
}
export const useDimensionsAndMetrics: UseDimensionsAndMetrics = property => {
  const gapi = useSelector((state: AppState) => state.gapi)
  const dataAPI = useMemo(() => gapi?.client.analyticsdata, [gapi])
  const [state, setState] = useState<State>(RequestState.NotStarted)
  const [fields, setFields] = usePersistantObject<{
    [key: string]: {
      dimensions: Dimension[] | undefined
      metrics: Metric[] | undefined
    }
  }>(StorageKey.ga4DimensionsMetricsFields)

  useEffect(() => {
    if (dataAPI === undefined) {
      return
    }
    // TODO this probably isn't ideal since it always shows loading even if
    // there was something in cache.
    setState(RequestState.Loading)
    dataAPI.properties
      .getMetadata({ name: `properties/${property}/metadata` })
      .then(response => {
        const { dimensions, metrics } = response.result
        setFields(old => {
          const nu = { dimensions, metrics }
          const existing = old?.[property]
          if (
            existing !== undefined &&
            JSON.stringify(existing) === JSON.stringify(nu)
          ) {
            console.log("values were the same")
            return old
          } else {
            return { ...(old || {}), [property]: { dimensions, metrics } }
          }
        })
        setState(RequestState.Finished)
      })
  }, [dataAPI, setFields, property])

  const dimensions = useMemo(() => fields?.[property]?.dimensions, [
    fields,
    property,
  ])
  const metrics = useMemo(() => fields?.[property]?.metrics, [fields, property])

  return { dimensions, metrics, state }
}
