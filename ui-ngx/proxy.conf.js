/*
 * Copyright © 2016-2023 The Thingsboard Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const forwardUrl = "https://cfl-rec.it.masteris.com:443";
const wsForwardUrl = "wss://cfl-rec.it.masteris.com:443";
const ruleNodeUiforwardUrl = forwardUrl;

const PROXY_CONFIG = {
  "/api": {
    "target": forwardUrl,
    "secure": true,
    "changeOrigin": true
  },
  "/static/rulenode": {
    "target": ruleNodeUiforwardUrl,
    "secure": true,
    "changeOrigin": true
  },
  "/static/widgets": {
    "target": forwardUrl,
    "secure": true,
    "changeOrigin": true
  },
  "/oauth2": {
    "target": forwardUrl,
    "secure": true,
    "changeOrigin": true
  },
  "/login/oauth2": {
    "target": forwardUrl,
    "secure": true,
    "changeOrigin": true
  },
  "/api/ws": {
    "target": wsForwardUrl,
    "ws": true,
    "secure": true,
    "changeOrigin": true
  },
};

module.exports = PROXY_CONFIG;
