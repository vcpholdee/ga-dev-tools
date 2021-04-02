// Copyright 2020 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from "react"

import { HasView } from "../../../components/ViewSelector"
import { StorageKey } from "../../../constants"
import LinkedTextField from "../../../components/LinkedTextField"
import GADate from "../../../components/GADate"
import useHistogramRequest from "./_useHistogramRequest"
import useHistogramRequestParameters from "./_useHistogramRequestParameters"
import { useEffect } from "react"
import { ReportsRequest } from "../_RequestComposer"
import {
  MetricsPicker,
  DimensionsPicker,
  SegmentPicker,
  V4SamplingLevelPicker,
} from "../../../components/UAPickers"

export const linkFor = (hash: string) =>
  `https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#${hash}`

export const titleFor = (id: string) => `See ${id} on devsite.`

interface HistogramRequestProps {
  view: HasView | undefined
  controlWidth: string
  setRequestObject: (request: ReportsRequest | undefined) => void
}

const HistogramRequest: React.FC<HistogramRequestProps> = ({
  view,
  controlWidth,
  setRequestObject,
  children,
}) => {
  const {
    viewId,
    setViewId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedDimensions,
    setSelectedDimensions,
    selectedMetrics,
    setSelectedMetrics,
    buckets,
    setBuckets,
    filtersExpression,
    setFiltersExpression,
    selectedSegment,
    setSelectedSegment,
    samplingLevel,
    setSamplingLevel,
  } = useHistogramRequestParameters(view)
  const requestObject = useHistogramRequest({
    viewId,
    startDate,
    endDate,
    selectedDimensions,
    selectedMetrics,
    buckets,
    filtersExpression,
    selectedSegment,
    samplingLevel,
  })

  useEffect(() => {
    setRequestObject(requestObject)
  }, [requestObject, setRequestObject])

  return (
    <>
      <section className={controlWidth}>
        <LinkedTextField
          href={linkFor("ReportRequest.FIELDS.view_id")}
          linkTitle={titleFor("viewId")}
          label="viewId"
          value={viewId}
          onChange={setViewId}
          required
          helperText="The analytics view ID from which to retrieve data."
        />
        <GADate
          required
          value={startDate || ""}
          onChange={setStartDate}
          href="https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#ReportRequest.FIELDS.date_ranges"
          linkTitle="see dateRanges on Devsite."
          label="startDate"
          helperText="The start of the date range for the data request. Format: YYYY-MM-DD."
        />
        <GADate
          required
          value={endDate || ""}
          onChange={setEndDate}
          href="https://developers.google.com/analytics/devguides/reporting/core/v4/rest/v4/reports/batchGet#ReportRequest.FIELDS.date_ranges"
          linkTitle="see dateRanges on Devsite."
          label="endDate"
          helperText="The end of the date range for the data request. Format: YYYY-MM-DD."
        />
        <MetricsPicker
          setMetrics={setSelectedMetrics}
          storageKey={StorageKey.histogramRequestMetrics}
          helperText="The metrics to include in the request."
        />
        <DimensionsPicker
          setDimensions={setSelectedDimensions}
          storageKey={StorageKey.histogramRequestDimensions}
          helperText="The dimensions to include in the request."
        />
        <LinkedTextField
          href={linkFor("Dimension.FIELDS.histogram_buckets")}
          linkTitle={titleFor("histogramBuckets[]")}
          label="Buckets"
          value={buckets || ""}
          onChange={setBuckets}
          required
          helperText="The buckets to use for the histogram request."
        />
        <LinkedTextField
          href={linkFor("ReportRequest.FIELDS.filters_expression")}
          linkTitle={titleFor("filtersExpression")}
          label="Filters Expression"
          value={filtersExpression || ""}
          onChange={setFiltersExpression}
          helperText="Filters that restrict the data returned for the histogram request."
        />
        <SegmentPicker
          setSegment={setSelectedSegment}
          storageKey={StorageKey.histogramRequestSegment}
          helperText="The segment to use for the request."
        />
        <V4SamplingLevelPicker
          setSamplingLevel={setSamplingLevel}
          storageKey={StorageKey.histogramSamplingLevel}
          helperText="The desired sample size for the report."
        />
        {children}
      </section>
    </>
  )
}

export default HistogramRequest
