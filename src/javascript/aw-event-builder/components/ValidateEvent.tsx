// Copyright 2016 Google Inc. All rights reserved.
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

/* global $ */

import React from "react";
import Textarea from "react-textarea-autosize";
import { gaAll } from "../../analytics";
import Icon from "../../components/icon";
import IconButton from "../../components/icon-button";
import CopyButton from "../../hit-builder/components/copy-button";
import supports from "../../supports";
import { sleep } from "../../utils";
import actions from "../actions";
import {
  ValidationMessage,
  State,
  MPEvent,
  ValidationStatus as ValidationStatusT,
  Parameters,
} from "../types";
import { useSelector, useDispatch } from "react-redux";
import classnames from "classnames";
import { parameterizedUrl, payloadFor, ClientIds } from "../event";

const ACTION_TIMEOUT = 1500;

const EventElement: React.FC = () => {
  const measurement_id = useSelector<State, string>((a) => a.measurement_id);
  const firebase_app_id = useSelector<State, string>((a) => a.firebase_app_id);
  const api_secret = useSelector<State, string>((a) => a.api_secret);
  const validationStatus = useSelector<State, ValidationStatusT>(
    (a) => a.validationStatus
  );
  const className = classnames("HitElement", {
    "HitElement--valid": validationStatus === ValidationStatusT.Valid,
    "HitElement--invalid": validationStatus === ValidationStatusT.Invalid,
  });

  return (
    <section className={className}>
      <ValidationStatus />
      <div className="HitElement-body">
        <div className="HitElement-requestInfo">
          POST /mp/collect?
          {measurement_id !== ""
            ? `measurement_id=${measurement_id}`
            : firebase_app_id !== ""
            ? `firebase_app_id=${firebase_app_id}`
            : "measurement_id="}
          &api_secret={api_secret} HTTP/1.1
          <br />
          Host: www.google-analytics.com
        </div>
        <div className="HitElement-requestBody">
          <div className="FormControl FormControl--full">
            <label className="FormControl-label">Event payload</label>
            <div className="FormControl-body">
              <EventPayloadInput />
            </div>
          </div>
        </div>
        <EventActions />
      </div>
    </section>
  );
};

export default EventElement;

const ValidationStatus: React.FC = () => {
  const validationMessages = useSelector<State, ValidationMessage[]>(
    (a) => a.validationMessages
  );
  const validationStatus = useSelector<State>((a) => a.validationStatus);
  switch (validationStatus) {
    case ValidationStatusT.Valid:
      return (
        <header className="HitElement-status">
          <span className="HitElement-statusIcon">
            <Icon type="check" />
          </span>
          <div className="HitElement-statusBody">
            <h1 className="HitElement-statusHeading">Event is valid!</h1>
            <p className="HitElement-statusMessage">
              Use the controls below to copy the event payload or share it with
              coworkers.
              <br />
              You can also send the event to Google Analytics and watch it in
              action in the Real Time view.
            </p>
          </div>
        </header>
      );
    case ValidationStatusT.Invalid:
      return (
        <header className="HitElement-status">
          <span className="HitElement-statusIcon">
            <Icon type="error-outline" />
          </span>
          <div className="HitElement-statusBody">
            <h1 className="HitElement-statusHeading">Event is invalid!</h1>
            <ul className="HitElement-statusMessage">
              {validationMessages.map((message) => (
                <li key={message.fieldPath}>{message.description}</li>
              ))}
            </ul>
          </div>
        </header>
      );
    default:
      return (
        <header className="HitElement-status">
          <span className="HitElement-statusIcon">
            <Icon type="warning" />
          </span>
          <div className="HitElement-statusBody">
            <h1 className="HitElement-statusHeading">
              This event has not yet been validated
            </h1>
            <p className="HitElement-statusMessage">
              You can update the event using any of the controls below.
              <br />
              When you're done, click the "Validate Event" button to make sure
              everything's OK.
            </p>
          </div>
        </header>
      );
  }
};

const EventActions: React.FC = () => {
  const event = useSelector<State, MPEvent>((a) => a.event);
  const client_id = useSelector<State, string>((a) => a.client_id);
  const app_instance_id = useSelector<State, string>((a) => a.app_instance_id);
  const user_id = useSelector<State, string>((a) => a.user_id);
  const measurement_id = useSelector<State, string>((a) => a.measurement_id);
  const timestamp_micros = useSelector<State, number | null>(
    (a) => a.timestamp_micros
  );
  const non_personalized_ads = useSelector<State, boolean>(
    (a) => a.non_personalized_ads
  );
  const api_secret = useSelector<State, string>((a) => a.api_secret);
  const firebase_app_id = useSelector<State, string>((a) => a.firebase_app_id);
  const validationStatus = useSelector<State, ValidationStatusT>(
    (a) => a.validationStatus
  );
  const user_properties = useSelector<State, Parameters>(
    (a) => a.user_properties
  );
  const [payload, setPayload] = React.useState<any>({});
  const [linkToEvent, setLinkToEvent] = React.useState<string>("");

  React.useEffect(() => {
    const url = parameterizedUrl({
      client_id,
      app_instance_id,
      user_id,
      event,
      measurement_id,
      firebase_app_id,
      api_secret,
      user_properties,
      timestamp_micros,
      non_personalized_ads,
    });
    setLinkToEvent(url);
  }, [
    app_instance_id,
    client_id,
    user_id,
    event,
    measurement_id,
    firebase_app_id,
    api_secret,
    user_properties,
    timestamp_micros,
    non_personalized_ads,
  ]);

  React.useEffect(() => {
    let clientIds: ClientIds;
    if (clientId !== "") {
      clientIds = { client_id, user_id, type: "web" };
    } else {
      clientIds = {
        app_instance_id,
        user_id,
        type: "mobile",
      };
    }
    setPayload(
      payloadFor(
        [event],
        clientIds,
        user_properties,
        timestamp_micros,
        non_personalized_ads
      )
    );
  }, [
    event,
    client_id,
    app_instance_id,
    user_id,
    user_properties,
    timestamp_micros,
    non_personalized_ads,
  ]);
  const [eventSent, setEventSent] = React.useState<boolean>(false);
  React.useEffect(() => {
    setEventSent(false);
  }, [payload]);

  /**
   * Sends the event payload to Google Analytics and updates the button state
   * to indicate the event was successfully sent. After 1 second the button
   * gets restored to its original state.
   */
  const sendEvent = React.useCallback(async () => {
    dispatch(actions.sendEvent);
    setEventSent(true);
    gaAll("send", "event", {
      eventCategory: "GA4 Event Builder",
      eventAction: "send",
      eventLabel: "payload",
    });
    await sleep(ACTION_TIMEOUT);
    setEventSent(false);
  }, [payload]);

  const dispatch = useDispatch();
  const validateEvent = React.useCallback(() => {
    dispatch(actions.validateEvent);
  }, [dispatch]);

  if (validationStatus != "VALID") {
    return (
      <ValidateEventButton
        validationStatus={validationStatus}
        validateEvent={validateEvent}
      />
    );
  }

  const sendEventButton = (
    <IconButton
      className="Button Button--success Button--withIcon"
      type={eventSent ? "check" : "send"}
      onClick={sendEvent}
    >
      Send event to Google Analytics
    </IconButton>
  );

  if (supports.copyToClipboard()) {
    return (
      <div className="HitElement-action">
        <div className="ButtonSet">
          {sendEventButton}
          <CopyButton
            textToCopy={JSON.stringify(payload)}
            type="content-paste"
            appPlusWeb
          >
            Copy event payload
          </CopyButton>
          <CopyButton type="link" textToCopy={linkToEvent} appPlusWeb link>
            Copy sharable link to event
          </CopyButton>
        </div>
      </div>
    );
  } else {
    return <div className="HitElement-action">{sendEventButton}</div>;
  }
};

interface ValidateEventButtonProps {
  validationStatus: ValidationStatusT;
  validateEvent: () => void;
}

const ValidateEventButton: React.FC<ValidateEventButtonProps> = ({
  validationStatus,
  validateEvent,
}) => {
  let buttonText: string;
  switch (validationStatus) {
    case ValidationStatusT.Invalid:
      buttonText = "Revalidate event";
      break;
    case ValidationStatusT.Pending:
      buttonText = "Validating...";
      break;
    default:
      buttonText = "Validate event";
      break;
  }

  return (
    <div className="HitElement-action">
      <button
        className="Button Button--action"
        disabled={validationStatus === ValidationStatusT.Pending}
        onClick={validateEvent}
      >
        {buttonText}
      </button>
    </div>
  );
};

const EventPayloadInput: React.FC = () => {
  const event = useSelector<State, MPEvent>((a) => a.event);
  const client_id = useSelector<State, string>((a) => a.client_id);
  const app_instance_id = useSelector<State, string>((a) => a.app_instance_id);
  const user_id = useSelector<State, string>((a) => a.user_id);
  const timestamp_micros = useSelector<State, number | null>(
    (a) => a.timestamp_micros
  );
  const non_personalized_ads = useSelector<State, boolean>(
    (a) => a.non_personalized_ads
  );
  const user_properties = useSelector<State, Parameters>(
    (a) => a.user_properties
  );
  const [payload, setPayload] = React.useState<any>({});

  React.useEffect(() => {
    let clientIds: ClientIds;
    if (client_id !== "") {
      clientIds = { client_id, user_id, type: "web" };
    } else {
      clientIds = {
        app_instance_id,
        user_id,
        type: "mobile",
      };
    }
    setPayload(
      payloadFor(
        [event],
        clientIds,
        user_properties,
        timestamp_micros,
        non_personalized_ads
      )
    );
  }, [
    event,
    client_id,
    user_id,
    user_properties,
    app_instance_id,
    timestamp_micros,
    non_personalized_ads,
  ]);

  return (
    <Textarea
      className="FormField"
      value={JSON.stringify(payload, undefined, "  ")}
      disabled
    />
  );
};
