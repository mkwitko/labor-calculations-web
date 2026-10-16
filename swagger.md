# Labor Calculations API

Version: 2.0.0

## Endpoints

### GET /auth/status

**Summary:** Check auth


Check auth to the application




**Responses:**

- **200**: Default Response


---
### POST /auth/refresh

**Summary:** Refresh token


Refresh the access and refresh tokens



**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "refreshToken": {
      "type": "string"
    }
  },
  "required": [
    "refreshToken"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /auth/sign-in

**Summary:** Sign in


Sign in to the application informing the mail and password



**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "mail": {
      "type": "string"
    },
    "password": {
      "type": "string"
    }
  },
  "required": [
    "mail",
    "password"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /auth/sign-out

**Summary:** Sign out


Sign out of the application




**Responses:**

- **204**: Default Response


---
### POST /auth/switch-organization

**Summary:** Switch the active organization


Reissues the access and refresh tokens carrying the requested organization



**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "organizationId": {
      "type": "string"
    }
  },
  "required": [
    "organizationId"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /organizations

**Summary:** List organizations the authenticated user belongs to





**Responses:**

- **200**: Default Response


---
### GET /organizations/{organizationId}/members

**Summary:** List active members of the organization



**Parameters:**

- `organizationId` (path) required



**Responses:**

- **200**: Default Response


---
### PATCH /organizations/{organizationId}/members/{membershipId}

**Summary:** Change a member's role



**Parameters:**

- `organizationId` (path) required
- `membershipId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": [
        "admin",
        "lawyer",
        "staff",
        "intern"
      ]
    }
  },
  "required": [
    "role"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /organizations/{organizationId}/members/{membershipId}

**Summary:** Remove a member from the organization



**Parameters:**

- `organizationId` (path) required
- `membershipId` (path) required



**Responses:**

- **200**: Default Response


---
### DELETE /organizations/{organizationId}/members/me

**Summary:** Leave the organization



**Parameters:**

- `organizationId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /organizations/{organizationId}/invites

**Summary:** Invite someone to the organization



**Parameters:**

- `organizationId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    },
    "role": {
      "type": "string",
      "enum": [
        "admin",
        "lawyer",
        "staff",
        "intern"
      ]
    }
  },
  "required": [
    "email",
    "role"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /organizations/{organizationId}/invites

**Summary:** List pending invites



**Parameters:**

- `organizationId` (path) required



**Responses:**

- **200**: Default Response


---
### DELETE /organizations/{organizationId}/invites/{inviteId}

**Summary:** Revoke a pending invite



**Parameters:**

- `organizationId` (path) required
- `inviteId` (path) required



**Responses:**

- **200**: Default Response


---
### GET /invites/{token}

**Summary:** Read an invite by its token



**Parameters:**

- `token` (path) required



**Responses:**

- **200**: Default Response


---
### POST /invites/accept

**Summary:** Accept an invite




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "token": {
      "type": "string"
    }
  },
  "required": [
    "token"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /organizations/{organizationId}/transfer-ownership

**Summary:** Transfer ownership of the organization



**Parameters:**

- `organizationId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "userId": {
      "type": "string"
    }
  },
  "required": [
    "userId"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### GET /organizations/{organizationId}/plan

**Summary:** Read the current plan and how much of it is occupied



**Parameters:**

- `organizationId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /organizations/{organizationId}/plan

**Summary:** Move the organization to another plan



**Parameters:**

- `organizationId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "code": {
      "type": "string",
      "enum": [
        "solo",
        "banca",
        "escritorio",
        "max"
      ]
    },
    "interval": {
      "type": "string",
      "enum": [
        "monthly",
        "yearly"
      ]
    }
  },
  "required": [
    "code",
    "interval"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### GET /organizations/{organizationId}/plan/preview

**Summary:** Preview the cost of moving to another plan



**Parameters:**

- `code` (query) required
- `interval` (query) required
- `organizationId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /users

**Summary:** Create user




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2
    },
    "mail": {
      "type": "string",
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    },
    "document": {
      "type": "string",
      "minLength": 11
    },
    "oabNumber": {
      "type": "string",
      "minLength": 3
    },
    "phone": {
      "type": "string"
    },
    "password": {
      "type": "string",
      "minLength": 8
    },
    "referralCode": {
      "type": "string",
      "minLength": 4,
      "maxLength": 16
    },
    "officeName": {
      "type": "string"
    }
  },
  "required": [
    "name",
    "mail",
    "document",
    "oabNumber",
    "password"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### DELETE /users/{id}

**Summary:** Soft delete a user



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **403**: Default Response
- **404**: Default Response


---
### PATCH /users/{id}

**Summary:** Update a user's data



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "document": {
      "type": "string"
    },
    "officeName": {
      "type": "string"
    },
    "oabNumber": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "logoUrl": {
      "anyOf": [
        {
          "type": "string",
          "format": "uri"
        },
        {
          "type": "string",
          "enum": [
            ""
          ]
        }
      ]
    },
    "address": {
      "type": "string"
    },
    "website": {
      "anyOf": [
        {
          "type": "string",
          "format": "uri"
        },
        {
          "type": "string",
          "enum": [
            ""
          ]
        }
      ]
    },
    "bio": {
      "type": "string"
    },
    "brandPrimaryColor": {
      "type": "string",
      "pattern": "^#[0-9a-fA-F]{6}$"
    },
    "letterheadUrl": {
      "nullable": true,
      "anyOf": [
        {
          "type": "string",
          "format": "uri"
        },
        {
          "type": "string",
          "enum": [
            ""
          ]
        }
      ]
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **403**: Default Response
- **404**: Default Response


---
### GET /users/me

**Summary:** Get authenticated user





**Responses:**

- **200**: Default Response


---
### GET /user/prefs

**Summary:** Get user notification preferences





**Responses:**

- **200**: Default Response


---
### PATCH /user/prefs

**Summary:** Update user notification preferences




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "remindD3": {
      "type": "boolean"
    },
    "remindD1": {
      "type": "boolean"
    },
    "onbNudgeOptOut": {
      "type": "boolean"
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### GET /onboarding/status

**Summary:** Get onboarding checklist status





**Responses:**

- **200**: Default Response


---
### POST /user/branding/upload-url

**Summary:** Get presigned upload URL for a branding asset




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "asset": {
      "type": "string",
      "enum": [
        "logo",
        "letterhead"
      ]
    },
    "mimeType": {
      "type": "string"
    },
    "sizeBytes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 5242880
    }
  },
  "required": [
    "asset",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### POST /billing/checkout

**Summary:** Create checkout session




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "code": {
      "type": "string",
      "enum": [
        "solo",
        "banca",
        "escritorio",
        "max"
      ]
    },
    "interval": {
      "type": "string",
      "enum": [
        "monthly",
        "yearly"
      ]
    }
  },
  "required": [
    "code",
    "interval"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### POST /billing/portal

**Summary:** Create customer portal session





**Responses:**

- **200**: Default Response


---
### GET /billing/subscription

**Summary:** Get subscription status





**Responses:**

- **200**: Default Response


---
### GET /billing/plans

**Summary:** List office plans as configured in Stripe





**Responses:**

- **200**: Default Response


---
### POST /billing/webhook

**Summary:** Stripe webhook





**Responses:**

- **200**: Default Response
- **400**: Default Response
- **503**: Default Response


---
### GET /referral/me

**Summary:** Get referral program summary





**Responses:**

- **200**: Default Response


---
### POST /referral/invite

**Summary:** Invite a colleague by e-mail




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    }
  },
  "required": [
    "email"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /referral/resolve/{code}

**Summary:** Resolve a referral code



**Parameters:**

- `code` (path) required



**Responses:**

- **200**: Default Response


---
### POST /clients

**Summary:** Create client




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2
    },
    "document": {
      "type": "string"
    },
    "mail": {
      "type": "string",
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    },
    "phone": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "name"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /clients

**Summary:** List clients



**Parameters:**

- `limit` (query) optional
- `cursor` (query) optional



**Responses:**

- **200**: Default Response


---
### POST /clients/{clientId}/portal-invite

**Summary:** Issue a portal first-access link for the client



**Parameters:**

- `clientId` (path) required



**Responses:**

- **201**: Default Response


---
### DELETE /clients/{clientId}

**Summary:** Delete client



**Parameters:**

- `clientId` (path) required



**Responses:**

- **200**: Default Response


---
### GET /clients/{clientId}

**Summary:** Get client



**Parameters:**

- `clientId` (path) required



**Responses:**

- **200**: Default Response


---
### PATCH /clients/{clientId}

**Summary:** Update client



**Parameters:**

- `clientId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2
    },
    "document": {
      "type": "string"
    },
    "mail": {
      "type": "string",
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    },
    "phone": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### POST /cases

**Summary:** Create case




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1
    },
    "clientId": {
      "type": "string"
    },
    "processNumber": {
      "type": "string"
    },
    "court": {
      "type": "string"
    },
    "vara": {
      "type": "string"
    },
    "phase": {
      "type": "string",
      "enum": [
        "pre_judicial",
        "distribuido",
        "conhecimento",
        "recurso",
        "execucao",
        "encerrado"
      ]
    },
    "actionType": {
      "type": "string",
      "enum": [
        "verbas_rescisorias",
        "horas_extras",
        "equiparacao_salarial",
        "desvio_funcao",
        "danos_morais",
        "rescisao_indireta",
        "adicional_insalubridade",
        "adicional_periculosidade",
        "fgts_multa",
        "reconhecimento_vinculo",
        "outro"
      ]
    },
    "valorCausa": {
      "type": "number",
      "minimum": 0
    },
    "observations": {
      "type": "string"
    },
    "openedAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "calculationId": {
      "type": "string"
    }
  },
  "required": [
    "title"
  ]
}
```

**Responses:**

- **201**: Default Response
- **404**: Default Response


---
### GET /cases

**Summary:** List cases



**Parameters:**

- `limit` (query) optional
- `cursor` (query) optional
- `phase` (query) optional
- `search` (query) optional



**Responses:**

- **200**: Default Response


---
### GET /cases/{caseId}

**Summary:** Get case by id



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### PATCH /cases/{caseId}

**Summary:** Update case



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1
    },
    "clientId": {
      "nullable": true,
      "type": "string"
    },
    "processNumber": {
      "nullable": true,
      "type": "string"
    },
    "court": {
      "nullable": true,
      "type": "string"
    },
    "vara": {
      "nullable": true,
      "type": "string"
    },
    "phase": {
      "type": "string",
      "enum": [
        "pre_judicial",
        "distribuido",
        "conhecimento",
        "recurso",
        "execucao",
        "encerrado"
      ]
    },
    "actionType": {
      "nullable": true,
      "type": "string",
      "enum": [
        "verbas_rescisorias",
        "horas_extras",
        "equiparacao_salarial",
        "desvio_funcao",
        "danos_morais",
        "rescisao_indireta",
        "adicional_insalubridade",
        "adicional_periculosidade",
        "fgts_multa",
        "reconhecimento_vinculo",
        "outro"
      ]
    },
    "valorCausa": {
      "nullable": true,
      "type": "number"
    },
    "riskLevel": {
      "nullable": true,
      "type": "string",
      "enum": [
        "baixo",
        "medio",
        "alto"
      ]
    },
    "observations": {
      "nullable": true,
      "type": "string"
    },
    "closedAt": {
      "nullable": true,
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /cases/{caseId}

**Summary:** Delete case (soft)



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/restore

**Summary:** Restore deleted case



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/calculations/{calcId}

**Summary:** Link calculation to case



**Parameters:**

- `caseId` (path) required
- `calcId` (path) required



**Responses:**

- **200**: Default Response


---
### DELETE /cases/{caseId}/calculations/{calcId}

**Summary:** Unlink calculation from case



**Parameters:**

- `caseId` (path) required
- `calcId` (path) required



**Responses:**

- **200**: Default Response


---
### GET /cases/{caseId}/timeline

**Summary:** Get case activity timeline



**Parameters:**

- `page` (query) optional
- `limit` (query) optional
- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### GET /cases/{caseId}/parties

**Summary:** List case parties



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/parties

**Summary:** Create case party



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": [
        "reclamante",
        "reclamada",
        "testemunha",
        "paradigma",
        "perito",
        "advogado_contrario",
        "outro"
      ]
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "document": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "role",
    "name"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### PATCH /cases/{caseId}/parties/{partyId}

**Summary:** Update case party



**Parameters:**

- `caseId` (path) required
- `partyId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "role": {
      "type": "string",
      "enum": [
        "reclamante",
        "reclamada",
        "testemunha",
        "paradigma",
        "perito",
        "advogado_contrario",
        "outro"
      ]
    },
    "name": {
      "type": "string",
      "minLength": 1
    },
    "document": {
      "type": "string"
    },
    "email": {
      "type": "string"
    },
    "phone": {
      "type": "string"
    },
    "notes": {
      "type": "string"
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### DELETE /cases/{caseId}/parties/{partyId}

**Summary:** Delete case party



**Parameters:**

- `caseId` (path) required
- `partyId` (path) required



**Responses:**

- **204**: Default Response


---
### GET /cases/{caseId}/tasks

**Summary:** List case tasks



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/tasks

**Summary:** Create case task



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string"
    },
    "dueAt": {},
    "priority": {
      "default": "media",
      "type": "string",
      "enum": [
        "baixa",
        "media",
        "alta"
      ]
    }
  },
  "required": [
    "title"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### PATCH /cases/{caseId}/tasks/{taskId}

**Summary:** Update case task



**Parameters:**

- `caseId` (path) required
- `taskId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string"
    },
    "dueAt": {
      "nullable": true
    },
    "status": {
      "type": "string",
      "enum": [
        "pendente",
        "em_andamento",
        "concluida"
      ]
    },
    "priority": {
      "type": "string",
      "enum": [
        "baixa",
        "media",
        "alta"
      ]
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### DELETE /cases/{caseId}/tasks/{taskId}

**Summary:** Delete case task



**Parameters:**

- `caseId` (path) required
- `taskId` (path) required



**Responses:**

- **204**: Default Response


---
### GET /cases/{caseId}/movements

**Summary:** List case movements



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/movements

**Summary:** Add a manual case movement



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "date": {},
    "description": {
      "type": "string",
      "minLength": 1
    },
    "code": {
      "type": "string"
    }
  },
  "required": [
    "date",
    "description"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /cases/{caseId}/movements/sync

**Summary:** Sync movements from CNJ DataJud by process number



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### DELETE /cases/{caseId}/movements/{movementId}

**Summary:** Delete a case movement



**Parameters:**

- `caseId` (path) required
- `movementId` (path) required



**Responses:**

- **204**: Default Response


---
### GET /cases/{caseId}/fee-agreement

**Summary:** Get case fee agreement



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### PUT /cases/{caseId}/fee-agreement

**Summary:** Create or update the case fee agreement



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "feeType": {
      "type": "string",
      "enum": [
        "percentual",
        "fixo",
        "exito"
      ]
    },
    "percent": {
      "nullable": true,
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "fixedValue": {
      "nullable": true,
      "type": "number",
      "minimum": 0
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "feeType"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### GET /integrations/google/status

**Summary:** Google Calendar integration status





**Responses:**

- **200**: Default Response


---
### GET /integrations/google/auth-url

**Summary:** Get Google OAuth consent URL





**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### GET /integrations/google/callback

**Summary:** Google OAuth callback



**Parameters:**

- `code` (query) optional
- `state` (query) optional
- `error` (query) optional



**Responses:**

- **200**: Default Response


---
### PATCH /integrations/google/prefs

**Summary:** Update Google Calendar sync preferences




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "syncHearings": {
      "type": "boolean"
    },
    "syncDeadlines": {
      "type": "boolean"
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### DELETE /integrations/google

**Summary:** Disconnect Google Calendar





**Responses:**

- **204**: Default Response


---
### GET /integrations/google/events

**Summary:** List importable Google Calendar events



**Parameters:**

- `from` (query) optional
- `to` (query) optional



**Responses:**

- **200**: Default Response


---
### POST /integrations/google/import

**Summary:** Import selected Google Calendar events




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "events": {
      "minItems": 1,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "googleEventId": {
            "type": "string"
          },
          "title": {
            "type": "string"
          },
          "description": {
            "nullable": true,
            "type": "string"
          },
          "location": {
            "nullable": true,
            "type": "string"
          },
          "startsAt": {
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
          },
          "endsAt": {
            "nullable": true,
            "type": "string",
            "format": "date-time",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
          },
          "allDay": {
            "type": "boolean"
          },
          "target": {
            "type": "string",
            "enum": [
              "personal",
              "hearing",
              "deadline"
            ]
          },
          "caseId": {
            "type": "string"
          },
          "hearingKind": {
            "type": "string",
            "enum": [
              "inicial",
              "conciliacao",
              "instrucao",
              "julgamento",
              "outra"
            ]
          },
          "deadlineKind": {
            "type": "string",
            "enum": [
              "contestacao",
              "recurso_ordinario",
              "embargos",
              "outros"
            ]
          }
        },
        "required": [
          "googleEventId",
          "title",
          "startsAt",
          "target"
        ]
      }
    }
  },
  "required": [
    "events"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### POST /agenda-events

**Summary:** Create agenda event




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string"
    },
    "location": {
      "type": "string"
    },
    "startsAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "endsAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "allDay": {
      "type": "boolean"
    },
    "remindEmail": {
      "type": "boolean"
    }
  },
  "required": [
    "title",
    "startsAt"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /agenda-events

**Summary:** List agenda events



**Parameters:**

- `from` (query) optional
- `to` (query) optional



**Responses:**

- **200**: Default Response


---
### PATCH /agenda-events/{id}

**Summary:** Update agenda event



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "nullable": true,
      "type": "string"
    },
    "location": {
      "nullable": true,
      "type": "string"
    },
    "startsAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "endsAt": {
      "nullable": true,
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "allDay": {
      "type": "boolean"
    },
    "remindEmail": {
      "type": "boolean"
    },
    "done": {
      "type": "boolean"
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /agenda-events/{id}

**Summary:** Delete agenda event



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### GET /monetary-indices

**Summary:** List monetary indices





**Responses:**

- **200**: Default Response


---
### PUT /monetary-indices/{month}

**Summary:** Create or update a monthly index (YYYY-MM)



**Parameters:**

- `month` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "ipcaE": {
      "type": "number"
    },
    "ipcaECumulative": {
      "type": "number"
    },
    "selic": {
      "type": "number"
    },
    "selicCumulative": {
      "type": "number"
    },
    "trd": {
      "type": "number"
    }
  },
  "required": [
    "ipcaE",
    "ipcaECumulative",
    "selic",
    "selicCumulative",
    "trd"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /monetary-indices/{month}

**Summary:** Delete a monthly index



**Parameters:**

- `month` (path) required



**Responses:**

- **204**: Default Response


---
### POST /monetary-indices/sync

**Summary:** Sync indices from Banco Central (SGS)





**Responses:**

- **200**: Default Response


---
### GET /cases/{caseId}/document-requirements

**Summary:** Get document requirements for case



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /cases/{caseId}/document-requirements

**Summary:** Create document requirement



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "kind": {
      "type": "string",
      "enum": [
        "ctps",
        "holerite",
        "contrato",
        "comprovante",
        "outros"
      ]
    },
    "customName": {
      "type": "string"
    },
    "description": {
      "type": "string",
      "minLength": 1
    },
    "isMandatory": {
      "default": true,
      "type": "boolean"
    },
    "dueDate": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "order": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    }
  },
  "required": [
    "kind",
    "description"
  ]
}
```

**Responses:**

- **201**: Default Response
- **404**: Default Response


---
### PATCH /document-requirements/{requirementId}

**Summary:** Update document requirement



**Parameters:**

- `requirementId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "customName": {
      "type": "string"
    },
    "description": {
      "type": "string",
      "minLength": 1
    },
    "isMandatory": {
      "type": "boolean"
    },
    "dueDate": {
      "nullable": true,
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "order": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### DELETE /document-requirements/{requirementId}

**Summary:** Delete document requirement



**Parameters:**

- `requirementId` (path) required



**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /document-requirements/{requirementId}/approve

**Summary:** Approve document



**Parameters:**

- `requirementId` (path) required



**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /document-requirements/{requirementId}/reject

**Summary:** Reject document



**Parameters:**

- `requirementId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "reason": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "reason"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /labor-calculation

**Summary:** Create labor calculation v2 (estimativa)




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "clientName": {
      "type": "string",
      "description": "Nome do reclamante. Aparece no cálculo e nos documentos."
    },
    "clientDocument": {
      "description": "CPF do reclamante, com ou sem pontuação.",
      "type": "string"
    },
    "clientId": {
      "description": "Id de um cliente já cadastrado, para vincular o cálculo a ele. Omita para um cálculo solto.",
      "type": "string"
    },
    "observations": {
      "description": "Texto livre guardado junto do cálculo.",
      "type": "string"
    },
    "startDate": {
      "description": "Data de admissão, em ISO 8601 (ex.: 2020-01-10)."
    },
    "endDate": {
      "description": "Data do término do contrato, em ISO 8601. Precisa ser posterior a startDate."
    },
    "lastSalary": {
      "type": "number",
      "description": "Última remuneração mensal, em reais. Base do aviso prévio, do 13º, das férias e do saldo de salário."
    },
    "baseSalary": {
      "type": "number",
      "description": "Salário base contratual, sem adicionais. Base do adicional de periculosidade e do de transferência."
    },
    "unpaid13ths": {
      "type": "number",
      "description": "Quantidade de décimos terceiros em atraso. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: o V3 apura o 13º por avos entre admissão e término."
    },
    "vacationCount": {
      "type": "number",
      "description": "Períodos de férias, no formato antigo da estimativa. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: use vacationVencidasCount para férias vencidas — as proporcionais saem dos avos."
    },
    "vacationVencidasCount": {
      "default": 0,
      "description": "Períodos aquisitivos completos não gozados. Cada um é pago em dobro na rescisão (CLT art. 137), já com o terço constitucional.",
      "type": "number",
      "minimum": 0
    },
    "priorNoticeWorked": {
      "type": "boolean",
      "description": "true quando o aviso prévio foi cumprido trabalhando; false quando é indenizado."
    },
    "priorNoticeDate": {
      "description": "Data da comunicação do aviso prévio, em ISO 8601."
    },
    "extraHours": {
      "type": "number",
      "description": "Total de horas extras do contrato inteiro — não a média mensal. Pagas com adicional de 50%."
    },
    "nightHours": {
      "type": "number",
      "description": "Total de horas noturnas do contrato inteiro — não a média mensal. O adicional vem de nightAdditionalPercent."
    },
    "insalubrityLevel": {
      "anyOf": [
        {
          "type": "number",
          "enum": [
            0
          ]
        },
        {
          "type": "number",
          "enum": [
            10
          ]
        },
        {
          "type": "number",
          "enum": [
            20
          ]
        },
        {
          "type": "number",
          "enum": [
            40
          ]
        }
      ],
      "description": "Grau de insalubridade: 0 (nenhum), 10 (mínimo), 20 (médio) ou 40 (máximo). Incide sobre o salário mínimo, por mês trabalhado (CLT art. 192)."
    },
    "dangerousWork": {
      "type": "boolean",
      "description": "Periculosidade: 30% do salário base por mês trabalhado (CLT art. 193 §1º)."
    },
    "lastThreeSalariesAvg": {
      "type": "number",
      "description": "Média das três últimas remunerações. Usada só para estimar o seguro-desemprego, pelas faixas da Lei 7.998/90."
    },
    "applyArt477Fine": {
      "default": false,
      "description": "Multa do art. 477 §8º da CLT: uma remuneração, quando o pagamento da rescisão atrasa.",
      "type": "boolean"
    },
    "terminationType": {
      "type": "string",
      "enum": [
        "sem_justa_causa",
        "com_justa_causa",
        "pedido_demissao",
        "rescisao_indireta"
      ],
      "description": "Modalidade da rescisão. com_justa_causa zera 13º, férias, aviso e multa de 40%."
    },
    "status": {
      "type": "string",
      "enum": [
        "em_andamento",
        "proposta_enviada",
        "acordo_fechado",
        "ajuizado"
      ]
    }
  },
  "required": [
    "clientName",
    "startDate",
    "endDate",
    "lastSalary",
    "baseSalary",
    "unpaid13ths",
    "vacationCount",
    "priorNoticeWorked",
    "extraHours",
    "nightHours",
    "insalubrityLevel",
    "dangerousWork",
    "lastThreeSalariesAvg",
    "terminationType"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /labor-calculation

**Summary:** List labor calculations



**Parameters:**

- `limit` (query) optional
- `cursor` (query) optional
- `clientId` (query) optional
- `search` (query) optional
- `terminationType` (query) optional
- `calculationVersion` (query) optional



**Responses:**

- **200**: Default Response


---
### POST /labor-calculation/v3

**Summary:** Create labor calculation v3 (liquidação)




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "clientName": {
      "type": "string",
      "description": "Nome do reclamante. Aparece no cálculo e nos documentos."
    },
    "clientDocument": {
      "description": "CPF do reclamante, com ou sem pontuação.",
      "type": "string"
    },
    "clientId": {
      "description": "Id de um cliente já cadastrado, para vincular o cálculo a ele. Omita para um cálculo solto.",
      "type": "string"
    },
    "observations": {
      "description": "Texto livre guardado junto do cálculo.",
      "type": "string"
    },
    "startDate": {
      "description": "Data de admissão, em ISO 8601 (ex.: 2020-01-10)."
    },
    "endDate": {
      "description": "Data do término do contrato, em ISO 8601. Precisa ser posterior a startDate."
    },
    "lastSalary": {
      "type": "number",
      "description": "Última remuneração mensal, em reais. Base do aviso prévio, do 13º, das férias e do saldo de salário."
    },
    "baseSalary": {
      "type": "number",
      "description": "Salário base contratual, sem adicionais. Base do adicional de periculosidade e do de transferência."
    },
    "unpaid13ths": {
      "type": "number",
      "description": "Quantidade de décimos terceiros em atraso. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: o V3 apura o 13º por avos entre admissão e término."
    },
    "vacationCount": {
      "type": "number",
      "description": "Períodos de férias, no formato antigo da estimativa. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: use vacationVencidasCount para férias vencidas — as proporcionais saem dos avos."
    },
    "vacationVencidasCount": {
      "default": 0,
      "description": "Períodos aquisitivos completos não gozados. Cada um é pago em dobro na rescisão (CLT art. 137), já com o terço constitucional.",
      "type": "number",
      "minimum": 0
    },
    "priorNoticeWorked": {
      "type": "boolean",
      "description": "true quando o aviso prévio foi cumprido trabalhando; false quando é indenizado."
    },
    "priorNoticeDate": {
      "description": "Data da comunicação do aviso prévio, em ISO 8601."
    },
    "extraHours": {
      "type": "number",
      "description": "Total de horas extras do contrato inteiro — não a média mensal. Pagas com adicional de 50%."
    },
    "nightHours": {
      "type": "number",
      "description": "Total de horas noturnas do contrato inteiro — não a média mensal. O adicional vem de nightAdditionalPercent."
    },
    "insalubrityLevel": {
      "anyOf": [
        {
          "type": "number",
          "enum": [
            0
          ]
        },
        {
          "type": "number",
          "enum": [
            10
          ]
        },
        {
          "type": "number",
          "enum": [
            20
          ]
        },
        {
          "type": "number",
          "enum": [
            40
          ]
        }
      ],
      "description": "Grau de insalubridade: 0 (nenhum), 10 (mínimo), 20 (médio) ou 40 (máximo). Incide sobre o salário mínimo, por mês trabalhado (CLT art. 192)."
    },
    "dangerousWork": {
      "type": "boolean",
      "description": "Periculosidade: 30% do salário base por mês trabalhado (CLT art. 193 §1º)."
    },
    "lastThreeSalariesAvg": {
      "type": "number",
      "description": "Média das três últimas remunerações. Usada só para estimar o seguro-desemprego, pelas faixas da Lei 7.998/90."
    },
    "applyArt477Fine": {
      "default": false,
      "description": "Multa do art. 477 §8º da CLT: uma remuneração, quando o pagamento da rescisão atrasa.",
      "type": "boolean"
    },
    "terminationType": {
      "type": "string",
      "enum": [
        "sem_justa_causa",
        "com_justa_causa",
        "pedido_demissao",
        "rescisao_indireta"
      ],
      "description": "Modalidade da rescisão. com_justa_causa zera 13º, férias, aviso e multa de 40%."
    },
    "salaryHistory": {
      "description": "Evolução salarial, mês a mês (YYYY-MM). Sem ela, o FGTS do período é apurado pelo salário informado.",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "month": {
            "type": "string"
          },
          "baseSalary": {
            "type": "number"
          },
          "lastSalary": {
            "type": "number"
          }
        },
        "required": [
          "month",
          "baseSalary",
          "lastSalary"
        ]
      }
    },
    "unpaidSalaries": {
      "description": "Meses com salário em atraso e quantos dias foram trabalhados em cada um. Viram saldo de salário.",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "month": {
            "type": "string"
          },
          "daysWorked": {
            "type": "integer",
            "minimum": 0,
            "maximum": 30
          }
        },
        "required": [
          "month",
          "daysWorked"
        ]
      }
    },
    "filingDate": {
      "description": "Data do ajuizamento, em ISO 8601. É dela que sai o corte da prescrição quinquenal."
    },
    "liquidationDate": {
      "description": "Data até a qual corrigir e contar juros, em ISO 8601. Ausente significa hoje."
    },
    "nightAdditionalPercent": {
      "default": 20,
      "description": "Percentual do adicional noturno (CLT art. 73 dá 20%). Percentual, não fração: 20 significa 20%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "satRate": {
      "default": 3,
      "description": "Alíquota do RAT/SAT usada nos encargos do empregador. Percentual: 3 significa 3%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "employerInssRate": {
      "default": 20,
      "description": "Alíquota patronal de INSS sobre as verbas salariais. Percentual: 20 significa 20%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "honorariosRate": {
      "default": 15,
      "description": "Percentual de honorários calculado sobre o valor da condenação. Percentual: 15 significa 15%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "irpfDependents": {
      "default": 0,
      "description": "Número de dependentes, para a dedução do IRPF.",
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "applyArt467": {
      "default": false,
      "description": "Art. 467 da CLT: acréscimo de 50% sobre as verbas rescisórias incontroversas não pagas na primeira audiência.",
      "type": "boolean"
    },
    "applyPrescricaoQuinquenal": {
      "default": false,
      "description": "Corta as parcelas anteriores a cinco anos da data de ajuizamento (CF art. 7º, XXIX).",
      "type": "boolean"
    },
    "salaryDifference": {
      "description": "Diferença salarial (equiparação, desvio de função, acúmulo), por períodos, com ou sem reflexos nas demais verbas.",
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "equiparacao",
            "desvio_funcao"
          ]
        },
        "paradigmName": {
          "type": "string",
          "maxLength": 200
        },
        "applyReflexos": {
          "default": true,
          "type": "boolean"
        },
        "periods": {
          "minItems": 1,
          "maxItems": 24,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "startMonth": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}$"
              },
              "endMonth": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}$"
              },
              "dueSalary": {
                "type": "number",
                "minimum": 0,
                "exclusiveMinimum": true
              },
              "receivedSalary": {
                "type": "number",
                "minimum": 0
              }
            },
            "required": [
              "startMonth",
              "endMonth",
              "dueSalary"
            ]
          }
        }
      },
      "required": [
        "type",
        "periods"
      ]
    },
    "customVerbas": {
      "description": "Verbas fora da tabela padrão, cada uma com valor mensal, intervalo de meses e natureza (salarial ou indenizatória).",
      "maxItems": 20,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "monthlyValue": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
          },
          "startMonth": {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}$"
          },
          "endMonth": {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}$"
          },
          "nature": {
            "default": "indenizatoria",
            "type": "string",
            "enum": [
              "indenizatoria",
              "salarial"
            ]
          }
        },
        "required": [
          "name",
          "monthlyValue",
          "startMonth",
          "endMonth"
        ]
      }
    },
    "intervalIntrajornadaHours": {
      "description": "Horas de intervalo suprimidas **por mês** (CLT art. 71 §4º), pagas com adicional de 50%. Diferente de extraHours, que é total do contrato.",
      "type": "number",
      "minimum": 0,
      "maximum": 300
    },
    "transferAdditionalMonths": {
      "description": "Meses em que houve transferência provisória: 25% do salário base em cada (CLT art. 469 §3º).",
      "type": "integer",
      "minimum": 0,
      "maximum": 600
    },
    "applyDsrOnExtra": {
      "description": "Reflexo em DSR sobre horas extras e adicional noturno (Lei 605/49).",
      "type": "boolean"
    },
    "stabilityMonths": {
      "description": "Meses de estabilidade a indenizar: salários do período mais os reflexos de 13º e férias.",
      "type": "integer",
      "minimum": 0,
      "maximum": 600
    },
    "fgtsAlreadyDeposited": {
      "description": "FGTS já depositado, em reais. Abatido do total devido.",
      "type": "number",
      "minimum": 0
    },
    "amountsAlreadyPaid": {
      "description": "Valores já pagos ao reclamante, em reais. Abatidos do total.",
      "type": "number",
      "minimum": 0
    }
  },
  "required": [
    "clientName",
    "startDate",
    "endDate",
    "lastSalary",
    "baseSalary",
    "unpaid13ths",
    "vacationCount",
    "priorNoticeWorked",
    "extraHours",
    "nightHours",
    "insalubrityLevel",
    "dangerousWork",
    "lastThreeSalariesAvg",
    "terminationType"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /labor-calculation/{id}

**Summary:** Get labor calculation by id



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### PUT /labor-calculation/{id}

**Summary:** Update labor calculation v2 (estimativa)



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "clientName": {
      "type": "string",
      "description": "Nome do reclamante. Aparece no cálculo e nos documentos."
    },
    "clientDocument": {
      "description": "CPF do reclamante, com ou sem pontuação.",
      "type": "string"
    },
    "clientId": {
      "description": "Id de um cliente já cadastrado, para vincular o cálculo a ele. Omita para um cálculo solto.",
      "type": "string"
    },
    "observations": {
      "description": "Texto livre guardado junto do cálculo.",
      "type": "string"
    },
    "startDate": {
      "description": "Data de admissão, em ISO 8601 (ex.: 2020-01-10)."
    },
    "endDate": {
      "description": "Data do término do contrato, em ISO 8601. Precisa ser posterior a startDate."
    },
    "lastSalary": {
      "type": "number",
      "description": "Última remuneração mensal, em reais. Base do aviso prévio, do 13º, das férias e do saldo de salário."
    },
    "baseSalary": {
      "type": "number",
      "description": "Salário base contratual, sem adicionais. Base do adicional de periculosidade e do de transferência."
    },
    "unpaid13ths": {
      "type": "number",
      "description": "Quantidade de décimos terceiros em atraso. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: o V3 apura o 13º por avos entre admissão e término."
    },
    "vacationCount": {
      "type": "number",
      "description": "Períodos de férias, no formato antigo da estimativa. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: use vacationVencidasCount para férias vencidas — as proporcionais saem dos avos."
    },
    "vacationVencidasCount": {
      "type": "number",
      "minimum": 0
    },
    "priorNoticeWorked": {
      "type": "boolean",
      "description": "true quando o aviso prévio foi cumprido trabalhando; false quando é indenizado."
    },
    "priorNoticeDate": {
      "description": "Data da comunicação do aviso prévio, em ISO 8601."
    },
    "extraHours": {
      "type": "number",
      "description": "Total de horas extras do contrato inteiro — não a média mensal. Pagas com adicional de 50%."
    },
    "nightHours": {
      "type": "number",
      "description": "Total de horas noturnas do contrato inteiro — não a média mensal. O adicional vem de nightAdditionalPercent."
    },
    "insalubrityLevel": {
      "anyOf": [
        {
          "type": "number",
          "enum": [
            0
          ]
        },
        {
          "type": "number",
          "enum": [
            10
          ]
        },
        {
          "type": "number",
          "enum": [
            20
          ]
        },
        {
          "type": "number",
          "enum": [
            40
          ]
        }
      ],
      "description": "Grau de insalubridade: 0 (nenhum), 10 (mínimo), 20 (médio) ou 40 (máximo). Incide sobre o salário mínimo, por mês trabalhado (CLT art. 192)."
    },
    "dangerousWork": {
      "type": "boolean",
      "description": "Periculosidade: 30% do salário base por mês trabalhado (CLT art. 193 §1º)."
    },
    "lastThreeSalariesAvg": {
      "type": "number",
      "description": "Média das três últimas remunerações. Usada só para estimar o seguro-desemprego, pelas faixas da Lei 7.998/90."
    },
    "applyArt477Fine": {
      "type": "boolean"
    },
    "terminationType": {
      "type": "string",
      "enum": [
        "sem_justa_causa",
        "com_justa_causa",
        "pedido_demissao",
        "rescisao_indireta"
      ],
      "description": "Modalidade da rescisão. com_justa_causa zera 13º, férias, aviso e multa de 40%."
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /labor-calculation/{id}

**Summary:** Delete labor calculation



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### GET /labor-calculation/stats

**Summary:** Get labor calculation stats for dashboard





**Responses:**

- **200**: Default Response


---
### GET /dashboard/action-items

**Summary:** Pending actions for the dashboard inbox





**Responses:**

- **200**: Default Response


---
### GET /dashboard/next-action

**Summary:** The single next action for the dashboard card





**Responses:**

- **200**: Default Response


---
### GET /dashboard/finance

**Summary:** Office financial summary





**Responses:**

- **200**: Default Response


---
### GET /settlements/{settlementId}/installments

**Summary:** List settlement installments



**Parameters:**

- `settlementId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /settlements/{settlementId}/installments/generate

**Summary:** Generate an installment schedule for the settlement



**Parameters:**

- `settlementId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "integer",
      "minimum": 1,
      "maximum": 120
    },
    "firstDueDate": {}
  },
  "required": [
    "count",
    "firstDueDate"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### PATCH /settlements/{settlementId}/installments/{installmentId}

**Summary:** Mark an installment paid/unpaid



**Parameters:**

- `settlementId` (path) required
- `installmentId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "paid": {
      "type": "boolean"
    }
  },
  "required": [
    "paid"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### GET /labor-calculation/{id}/scenarios

**Summary:** Compare calculation scenarios (with/without prescription, art. 467)



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /labor-calculation/{id}/reindex

**Summary:** Preview or apply fresh monetary indices to a stored calculation



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "confirm": {
      "default": false,
      "type": "boolean"
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### GET /labor-calculation/{id}/audit

**Summary:** Audit trail of a labor calculation



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### PUT /labor-calculation/v3/{id}

**Summary:** Update labor calculation v3 (liquidação)



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "clientName": {
      "type": "string",
      "description": "Nome do reclamante. Aparece no cálculo e nos documentos."
    },
    "clientDocument": {
      "description": "CPF do reclamante, com ou sem pontuação.",
      "type": "string"
    },
    "clientId": {
      "description": "Id de um cliente já cadastrado, para vincular o cálculo a ele. Omita para um cálculo solto.",
      "type": "string"
    },
    "observations": {
      "description": "Texto livre guardado junto do cálculo.",
      "type": "string"
    },
    "startDate": {
      "description": "Data de admissão, em ISO 8601 (ex.: 2020-01-10)."
    },
    "endDate": {
      "description": "Data do término do contrato, em ISO 8601. Precisa ser posterior a startDate."
    },
    "lastSalary": {
      "type": "number",
      "description": "Última remuneração mensal, em reais. Base do aviso prévio, do 13º, das férias e do saldo de salário."
    },
    "baseSalary": {
      "type": "number",
      "description": "Salário base contratual, sem adicionais. Base do adicional de periculosidade e do de transferência."
    },
    "unpaid13ths": {
      "type": "number",
      "description": "Quantidade de décimos terceiros em atraso. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: o V3 apura o 13º por avos entre admissão e término."
    },
    "vacationCount": {
      "type": "number",
      "description": "Períodos de férias, no formato antigo da estimativa. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: use vacationVencidasCount para férias vencidas — as proporcionais saem dos avos."
    },
    "vacationVencidasCount": {
      "type": "number",
      "minimum": 0
    },
    "priorNoticeWorked": {
      "type": "boolean",
      "description": "true quando o aviso prévio foi cumprido trabalhando; false quando é indenizado."
    },
    "priorNoticeDate": {
      "description": "Data da comunicação do aviso prévio, em ISO 8601."
    },
    "extraHours": {
      "type": "number",
      "description": "Total de horas extras do contrato inteiro — não a média mensal. Pagas com adicional de 50%."
    },
    "nightHours": {
      "type": "number",
      "description": "Total de horas noturnas do contrato inteiro — não a média mensal. O adicional vem de nightAdditionalPercent."
    },
    "insalubrityLevel": {
      "anyOf": [
        {
          "type": "number",
          "enum": [
            0
          ]
        },
        {
          "type": "number",
          "enum": [
            10
          ]
        },
        {
          "type": "number",
          "enum": [
            20
          ]
        },
        {
          "type": "number",
          "enum": [
            40
          ]
        }
      ],
      "description": "Grau de insalubridade: 0 (nenhum), 10 (mínimo), 20 (médio) ou 40 (máximo). Incide sobre o salário mínimo, por mês trabalhado (CLT art. 192)."
    },
    "dangerousWork": {
      "type": "boolean",
      "description": "Periculosidade: 30% do salário base por mês trabalhado (CLT art. 193 §1º)."
    },
    "lastThreeSalariesAvg": {
      "type": "number",
      "description": "Média das três últimas remunerações. Usada só para estimar o seguro-desemprego, pelas faixas da Lei 7.998/90."
    },
    "applyArt477Fine": {
      "type": "boolean"
    },
    "terminationType": {
      "type": "string",
      "enum": [
        "sem_justa_causa",
        "com_justa_causa",
        "pedido_demissao",
        "rescisao_indireta"
      ],
      "description": "Modalidade da rescisão. com_justa_causa zera 13º, férias, aviso e multa de 40%."
    },
    "salaryHistory": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "month": {
            "type": "string"
          },
          "baseSalary": {
            "type": "number"
          },
          "lastSalary": {
            "type": "number"
          }
        },
        "required": [
          "month",
          "baseSalary",
          "lastSalary"
        ]
      }
    },
    "unpaidSalaries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "month": {
            "type": "string"
          },
          "daysWorked": {
            "type": "integer",
            "minimum": 0,
            "maximum": 30
          }
        },
        "required": [
          "month",
          "daysWorked"
        ]
      }
    },
    "filingDate": {},
    "liquidationDate": {},
    "nightAdditionalPercent": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "satRate": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "employerInssRate": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "honorariosRate": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "irpfDependents": {
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "applyArt467": {
      "type": "boolean"
    },
    "applyPrescricaoQuinquenal": {
      "type": "boolean"
    },
    "salaryDifference": {
      "nullable": true,
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "equiparacao",
            "desvio_funcao"
          ]
        },
        "paradigmName": {
          "type": "string",
          "maxLength": 200
        },
        "applyReflexos": {
          "default": true,
          "type": "boolean"
        },
        "periods": {
          "minItems": 1,
          "maxItems": 24,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "startMonth": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}$"
              },
              "endMonth": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}$"
              },
              "dueSalary": {
                "type": "number",
                "minimum": 0,
                "exclusiveMinimum": true
              },
              "receivedSalary": {
                "type": "number",
                "minimum": 0
              }
            },
            "required": [
              "startMonth",
              "endMonth",
              "dueSalary"
            ]
          }
        }
      },
      "required": [
        "type",
        "periods"
      ]
    },
    "customVerbas": {
      "maxItems": 20,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "monthlyValue": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
          },
          "startMonth": {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}$"
          },
          "endMonth": {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}$"
          },
          "nature": {
            "default": "indenizatoria",
            "type": "string",
            "enum": [
              "indenizatoria",
              "salarial"
            ]
          }
        },
        "required": [
          "name",
          "monthlyValue",
          "startMonth",
          "endMonth"
        ]
      }
    },
    "intervalIntrajornadaHours": {
      "type": "number",
      "minimum": 0,
      "maximum": 300
    },
    "transferAdditionalMonths": {
      "type": "integer",
      "minimum": 0,
      "maximum": 600
    },
    "applyDsrOnExtra": {
      "type": "boolean"
    },
    "stabilityMonths": {
      "type": "integer",
      "minimum": 0,
      "maximum": 600
    },
    "fgtsAlreadyDeposited": {
      "type": "number",
      "minimum": 0
    },
    "amountsAlreadyPaid": {
      "type": "number",
      "minimum": 0
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### PATCH /labor-calculation/{id}/status

**Summary:** Update labor calculation status



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "em_andamento",
        "proposta_enviada",
        "acordo_fechado",
        "ajuizado"
      ]
    }
  },
  "required": [
    "status"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### POST /labor-calculation/{id}/restore

**Summary:** Restore deleted labor calculation



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### POST /labor-calculation/{id}/share

**Summary:** Set share code for labor calculation



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "shareCode": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "shareCode"
  ]
}
```

**Responses:**

- **204**: Default Response
- **404**: Default Response


---
### GET /shared-calculation/{id}

**Summary:** Get shared calculation by id and code



**Parameters:**

- `code` (query) required
- `id` (path) required



**Responses:**

- **200**: Default Response


---
### POST /labor-calculation/{id}/generate-document

**Summary:** Generate document from template using calculation data



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "templateId": {
      "type": "string"
    }
  },
  "required": [
    "templateId"
  ]
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /public/calculations

**Summary:** Calcula uma rescisão sem conta e devolve o link do resultado




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "terminationType": {
      "type": "string",
      "enum": [
        "sem_justa_causa",
        "com_justa_causa",
        "pedido_demissao",
        "rescisao_indireta"
      ]
    },
    "startDate": {
      "type": "string",
      "format": "date",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
    },
    "lastSalary": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true,
      "maximum": 1000000
    },
    "registeredContract": {
      "type": "boolean"
    },
    "priorNoticeWorked": {
      "type": "boolean"
    },
    "unpaid13ths": {
      "type": "number",
      "minimum": 0,
      "maximum": 10
    },
    "vacationVencidasCount": {
      "type": "number",
      "minimum": 0,
      "maximum": 10
    },
    "extraHours": {
      "type": "string",
      "enum": [
        "sim",
        "nao",
        "nao_sei"
      ]
    },
    "nightWork": {
      "type": "string",
      "enum": [
        "sim",
        "nao",
        "nao_sei"
      ]
    },
    "insalubrity": {
      "type": "string",
      "enum": [
        "sim",
        "nao",
        "nao_sei"
      ]
    },
    "dangerousWork": {
      "type": "string",
      "enum": [
        "sim",
        "nao",
        "nao_sei"
      ]
    },
    "source": {
      "default": "site",
      "type": "string",
      "maxLength": 60
    },
    "perspective": {
      "default": "trabalhador",
      "type": "string",
      "enum": [
        "trabalhador",
        "empresa"
      ]
    },
    "widgetKey": {
      "type": "string",
      "minLength": 10,
      "maxLength": 120
    },
    "hostSite": {
      "type": "string",
      "maxLength": 120
    }
  },
  "required": [
    "terminationType",
    "startDate",
    "endDate",
    "lastSalary",
    "registeredContract",
    "priorNoticeWorked",
    "unpaid13ths",
    "vacationVencidasCount",
    "extraHours",
    "nightWork",
    "insalubrity",
    "dangerousWork"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /public/calculations/horas-extras

**Summary:** Calcula horas extras sem conta e devolve o link do resultado




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "monthlySalary": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true,
      "maximum": 1000000
    },
    "weeklySchedule": {
      "anyOf": [
        {
          "type": "number",
          "enum": [
            44
          ]
        },
        {
          "type": "number",
          "enum": [
            40
          ]
        }
      ]
    },
    "extraHoursPerWeek": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true,
      "maximum": 40
    },
    "startDate": {
      "type": "string",
      "format": "date",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
    },
    "source": {
      "default": "site",
      "type": "string",
      "maxLength": 60
    },
    "widgetKey": {
      "type": "string",
      "minLength": 10,
      "maxLength": 120
    },
    "hostSite": {
      "type": "string",
      "maxLength": 120
    }
  },
  "required": [
    "monthlySalary",
    "weeklySchedule",
    "extraHoursPerWeek",
    "startDate",
    "endDate"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /public/calculations/ferias-decimo-terceiro

**Summary:** Calcula férias e 13º sem conta e devolve o link do resultado




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "monthlySalary": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true,
      "maximum": 1000000
    },
    "startDate": {
      "type": "string",
      "format": "date",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
    },
    "endDate": {
      "type": "string",
      "format": "date",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
    },
    "vacationVencidasCount": {
      "type": "number",
      "minimum": 0,
      "maximum": 10
    },
    "unpaid13ths": {
      "type": "number",
      "minimum": 0,
      "maximum": 10
    },
    "source": {
      "default": "site",
      "type": "string",
      "maxLength": 60
    },
    "widgetKey": {
      "type": "string",
      "minLength": 10,
      "maxLength": 120
    },
    "hostSite": {
      "type": "string",
      "maxLength": 120
    }
  },
  "required": [
    "monthlySalary",
    "startDate",
    "vacationVencidasCount",
    "unpaid13ths"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /public/calculations/{token}

**Summary:** Lê um cálculo público pelo token do link



**Parameters:**

- `token` (path) required



**Responses:**

- **200**: Default Response


---
### PATCH /public/calculations/{token}/contact

**Summary:** Guarda o contato de quem fez o cálculo (opcional)



**Parameters:**

- `token` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 120
    },
    "email": {
      "type": "string",
      "maxLength": 160,
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    },
    "phone": {
      "type": "string",
      "minLength": 8,
      "maxLength": 20
    }
  }
}
```

**Responses:**

- **204**: Default Response


---
### POST /public/calculations/{token}/claim

**Summary:** Importa um cálculo público para a organização do advogado



**Parameters:**

- `token` (path) required


**Request Body:**

```json
{
  "nullable": true,
  "type": "object",
  "properties": {
    "invitePortal": {
      "type": "boolean"
    }
  }
}
```

**Responses:**

- **201**: Default Response


---
### GET /public/widget/{key}

**Summary:** Marca do escritório dono do widget



**Parameters:**

- `key` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /organizations/{organizationId}/widget-key

**Summary:** Chave do widget da organização



**Parameters:**

- `organizationId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /organizations/{organizationId}/widget-key

**Summary:** Liga o widget ou troca a chave



**Parameters:**

- `organizationId` (path) required



**Responses:**

- **201**: Default Response


---
### DELETE /organizations/{organizationId}/widget-key

**Summary:** Desliga o widget



**Parameters:**

- `organizationId` (path) required



**Responses:**

- **200**: Default Response


---
### GET /widget/calculations

**Summary:** Cálculos que chegaram pelo widget do escritório





**Responses:**

- **200**: Default Response


---
### POST /widget/calculations/{id}/claim

**Summary:** Importa um cálculo do widget para a organização



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "nullable": true,
  "type": "object",
  "properties": {
    "invitePortal": {
      "type": "boolean"
    }
  }
}
```

**Responses:**

- **201**: Default Response


---
### POST /support/tickets

**Summary:** Abre um chamado ou envia uma sugestão




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "kind": {
      "type": "string",
      "enum": [
        "duvida",
        "problema",
        "sugestao"
      ]
    },
    "subject": {
      "type": "string",
      "minLength": 3,
      "maxLength": 160
    },
    "body": {
      "type": "string",
      "minLength": 1,
      "maxLength": 5000
    },
    "context": {
      "type": "object",
      "properties": {
        "path": {
          "type": "string",
          "maxLength": 300
        },
        "appVersion": {
          "type": "string",
          "maxLength": 60
        },
        "userAgent": {
          "type": "string",
          "maxLength": 400
        }
      }
    },
    "attachments": {
      "maxItems": 5,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fileKey": {
            "type": "string",
            "minLength": 1
          },
          "fileName": {
            "type": "string",
            "minLength": 1,
            "maxLength": 255
          },
          "mimeType": {
            "type": "string",
            "minLength": 1
          },
          "sizeBytes": {
            "type": "number",
            "minimum": 1,
            "maximum": 26214400
          }
        },
        "required": [
          "fileKey",
          "fileName",
          "mimeType",
          "sizeBytes"
        ]
      }
    }
  },
  "required": [
    "kind",
    "subject",
    "body"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /support/tickets

**Summary:** Chamados e sugestões do escritório



**Parameters:**

- `open` (query) optional



**Responses:**

- **200**: Default Response


---
### GET /support/tickets/{id}

**Summary:** Conversa de um chamado



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### POST /support/tickets/{id}/messages

**Summary:** Responde no chamado



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "body": {
      "type": "string",
      "minLength": 1,
      "maxLength": 5000
    },
    "attachments": {
      "maxItems": 5,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fileKey": {
            "type": "string",
            "minLength": 1
          },
          "fileName": {
            "type": "string",
            "minLength": 1,
            "maxLength": 255
          },
          "mimeType": {
            "type": "string",
            "minLength": 1
          },
          "sizeBytes": {
            "type": "number",
            "minimum": 1,
            "maximum": 26214400
          }
        },
        "required": [
          "fileKey",
          "fileName",
          "mimeType",
          "sizeBytes"
        ]
      }
    }
  },
  "required": [
    "body"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /support/tickets/{id}/close

**Summary:** Encerra o próprio chamado



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### POST /support/upload-url

**Summary:** URL assinada para subir um anexo do suporte




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1,
      "maximum": 26214400
    }
  },
  "required": [
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### GET /support/unread-count

**Summary:** Respostas do suporte ainda não lidas





**Responses:**

- **200**: Default Response


---
### GET /admin/funnel

**Summary:** Funil da calculadora pública, atravessando organizações



**Parameters:**

- `days` (query) optional



**Responses:**

- **200**: Default Response


---
### GET /admin/support/summary

**Summary:** Quantos chamados abertos e quantos por ler





**Responses:**

- **200**: Default Response


---
### GET /admin/support/tickets

**Summary:** Fila de chamados, atravessando organizações



**Parameters:**

- `status` (query) optional
- `kind` (query) optional
- `onlyOpen` (query) optional



**Responses:**

- **200**: Default Response


---
### GET /admin/support/tickets/{id}

**Summary:** Conversa completa, com o contexto de onde o chamado saiu



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### PATCH /admin/support/tickets/{id}

**Summary:** Move o chamado ou a sugestão de estágio



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "aberto",
        "em_analise",
        "aguardando_usuario",
        "planejado",
        "em_desenvolvimento",
        "concluido",
        "recusado"
      ]
    }
  },
  "required": [
    "status"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### POST /admin/support/tickets/{id}/messages

**Summary:** Responde ao escritório (e avisa por e-mail)



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "body": {
      "type": "string",
      "minLength": 1,
      "maxLength": 5000
    },
    "status": {
      "type": "string",
      "enum": [
        "aberto",
        "em_analise",
        "aguardando_usuario",
        "planejado",
        "em_desenvolvimento",
        "concluido",
        "recusado"
      ]
    },
    "attachments": {
      "maxItems": 5,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "fileKey": {
            "type": "string",
            "minLength": 1
          },
          "fileName": {
            "type": "string",
            "minLength": 1,
            "maxLength": 255
          },
          "mimeType": {
            "type": "string",
            "minLength": 1
          },
          "sizeBytes": {
            "type": "number",
            "minimum": 1,
            "maximum": 26214400
          }
        },
        "required": [
          "fileKey",
          "fileName",
          "mimeType",
          "sizeBytes"
        ]
      }
    }
  },
  "required": [
    "body"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### POST /admin/support/tickets/{id}/upload-url

**Summary:** URL assinada para o atendimento anexar arquivo



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1,
      "maximum": 26214400
    }
  },
  "required": [
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /batch-assessments

**Summary:** Cria uma avaliação de passivo a partir de uma folha




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 160
    },
    "clientId": {
      "type": "string"
    },
    "rows": {
      "minItems": 1,
      "maxItems": 300,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "reference": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "terminationType": {
            "type": "string",
            "enum": [
              "sem_justa_causa",
              "com_justa_causa",
              "pedido_demissao",
              "rescisao_indireta"
            ]
          },
          "startDate": {
            "type": "string",
            "format": "date",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
          },
          "endDate": {
            "type": "string",
            "format": "date",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
          },
          "lastSalary": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true,
            "maximum": 1000000
          },
          "registeredContract": {
            "default": true,
            "type": "boolean"
          },
          "priorNoticeWorked": {
            "default": false,
            "type": "boolean"
          },
          "unpaid13ths": {
            "default": 0,
            "type": "number",
            "minimum": 0,
            "maximum": 10
          },
          "vacationVencidasCount": {
            "default": 0,
            "type": "number",
            "minimum": 0,
            "maximum": 10
          },
          "extraHours": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          },
          "nightWork": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          },
          "insalubrity": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          },
          "dangerousWork": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          }
        },
        "required": [
          "reference",
          "terminationType",
          "startDate",
          "endDate",
          "lastSalary"
        ]
      }
    }
  },
  "required": [
    "name",
    "rows"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /batch-assessments

**Summary:** Lista as avaliações de passivo da organização





**Responses:**

- **200**: Default Response


---
### POST /batch-assessments/{id}/rows

**Summary:** Acrescenta linhas a uma avaliação — folha grande vem em partes



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "rows": {
      "minItems": 1,
      "maxItems": 300,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "reference": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "terminationType": {
            "type": "string",
            "enum": [
              "sem_justa_causa",
              "com_justa_causa",
              "pedido_demissao",
              "rescisao_indireta"
            ]
          },
          "startDate": {
            "type": "string",
            "format": "date",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
          },
          "endDate": {
            "type": "string",
            "format": "date",
            "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))$"
          },
          "lastSalary": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true,
            "maximum": 1000000
          },
          "registeredContract": {
            "default": true,
            "type": "boolean"
          },
          "priorNoticeWorked": {
            "default": false,
            "type": "boolean"
          },
          "unpaid13ths": {
            "default": 0,
            "type": "number",
            "minimum": 0,
            "maximum": 10
          },
          "vacationVencidasCount": {
            "default": 0,
            "type": "number",
            "minimum": 0,
            "maximum": 10
          },
          "extraHours": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          },
          "nightWork": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          },
          "insalubrity": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          },
          "dangerousWork": {
            "default": "nao",
            "type": "string",
            "enum": [
              "sim",
              "nao",
              "nao_sei"
            ]
          }
        },
        "required": [
          "reference",
          "terminationType",
          "startDate",
          "endDate",
          "lastSalary"
        ]
      }
    }
  },
  "required": [
    "rows"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### GET /batch-assessments/{id}

**Summary:** Avaliação com as linhas ordenadas por exposição



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### DELETE /batch-assessments/{id}

**Summary:** Exclui uma avaliação de passivo



**Parameters:**

- `id` (path) required



**Responses:**

- **204**: Default Response


---
### GET /batch-assessments/{batchId}/rows/{rowId}

**Summary:** Demonstrativo de uma linha: verbas que compõem custo e exposição



**Parameters:**

- `batchId` (path) required
- `rowId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /labor-calculation/{laborCalculationId}/settlements

**Summary:** Create a settlement



**Parameters:**

- `laborCalculationId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "agreementRate": {
      "type": "number",
      "minimum": 0.6,
      "maximum": 1
    },
    "feeType": {
      "type": "string",
      "enum": [
        "percentage",
        "fixed"
      ]
    },
    "feeValue": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true
    }
  },
  "required": [
    "feeType"
  ]
}
```

**Responses:**

- **201**: Default Response
- **404**: Default Response


---
### GET /labor-calculation/{laborCalculationId}/settlements

**Summary:** List settlements for a labor calculation



**Parameters:**

- `laborCalculationId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /settlements/{id}

**Summary:** Get settlement by id



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### PATCH /settlements/{id}

**Summary:** Update settlement status



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "status": {
      "type": "string",
      "enum": [
        "negotiating",
        "accepted",
        "rejected"
      ]
    }
  },
  "required": [
    "status"
  ]
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### DELETE /settlements/{id}

**Summary:** Delete settlement



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response


---
### POST /labor-calculation/{id}/settlement-simulation

**Summary:** Simulate settlement agreement



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "agreementRate": {
      "type": "number",
      "minimum": 0.6,
      "maximum": 1
    },
    "feeType": {
      "type": "string",
      "enum": [
        "percentage",
        "fixed"
      ]
    },
    "feeValue": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true
    }
  },
  "required": [
    "feeType"
  ]
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /cases/{caseId}/hearings

**Summary:** Create hearing



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "scheduledAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "kind": {
      "type": "string",
      "enum": [
        "inicial",
        "conciliacao",
        "instrucao",
        "julgamento",
        "outra"
      ]
    },
    "location": {
      "type": "string"
    },
    "link": {
      "type": "string",
      "format": "uri"
    },
    "notes": {
      "type": "string"
    }
  },
  "required": [
    "scheduledAt",
    "kind"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /cases/{caseId}/hearings

**Summary:** List hearings for a case



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### GET /hearings

**Summary:** List all hearings for the authenticated user





**Responses:**

- **200**: Default Response


---
### PATCH /hearings/{hearingId}

**Summary:** Update hearing



**Parameters:**

- `hearingId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "scheduledAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "kind": {
      "type": "string",
      "enum": [
        "inicial",
        "conciliacao",
        "instrucao",
        "julgamento",
        "outra"
      ]
    },
    "location": {
      "nullable": true,
      "type": "string"
    },
    "link": {
      "nullable": true,
      "type": "string",
      "format": "uri"
    },
    "notes": {
      "nullable": true,
      "type": "string"
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /hearings/{hearingId}

**Summary:** Delete hearing



**Parameters:**

- `hearingId` (path) required



**Responses:**

- **204**: Default Response


---
### POST /cases/{caseId}/deadlines

**Summary:** Create deadline



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "dueAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "kind": {
      "type": "string",
      "enum": [
        "contestacao",
        "recurso_ordinario",
        "embargos",
        "outros"
      ]
    },
    "customLabel": {
      "type": "string"
    }
  },
  "required": [
    "dueAt",
    "kind"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /cases/{caseId}/deadlines

**Summary:** List deadlines for a case



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /deadlines/calculate

**Summary:** Calculate a deadline date in business days




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "startDate": {},
    "businessDays": {
      "type": "integer",
      "minimum": 1,
      "maximum": 365
    },
    "startNextBusinessDay": {
      "default": true,
      "type": "boolean"
    }
  },
  "required": [
    "startDate",
    "businessDays"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### GET /deadlines

**Summary:** List all deadlines for the authenticated user





**Responses:**

- **200**: Default Response


---
### PATCH /deadlines/{deadlineId}

**Summary:** Update deadline



**Parameters:**

- `deadlineId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "dueAt": {
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    },
    "kind": {
      "type": "string",
      "enum": [
        "contestacao",
        "recurso_ordinario",
        "embargos",
        "outros"
      ]
    },
    "customLabel": {
      "nullable": true,
      "type": "string"
    },
    "doneAt": {
      "nullable": true,
      "type": "string",
      "format": "date-time",
      "pattern": "^(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))T(?:(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d(?:\\.\\d+)?)?(?:Z))$"
    }
  }
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /deadlines/{deadlineId}

**Summary:** Delete deadline



**Parameters:**

- `deadlineId` (path) required



**Responses:**

- **204**: Default Response


---
### POST /cases/{caseId}/notes

**Summary:** Create note



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "body": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "body"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /cases/{caseId}/notes

**Summary:** List notes



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### PATCH /cases/{caseId}/notes/{noteId}

**Summary:** Update note



**Parameters:**

- `caseId` (path) required
- `noteId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "body": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "body"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### DELETE /cases/{caseId}/notes/{noteId}

**Summary:** Delete note



**Parameters:**

- `caseId` (path) required
- `noteId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /v1/calculations/liquidacao

**Summary:** Calcular liquidação trabalhista


Calcula a liquidação de um contrato de trabalho com o mesmo motor
que o LexLaboral usa internamente: verbas rescisórias, adicionais,
FGTS, correção monetária pelos índices oficiais, juros, INSS e IRPF.

A resposta traz a **memória de cálculo verba por verba**, com o
fundamento legal de cada uma, e a procedência do resultado (versão do
motor e hash do conjunto de índices).

O cálculo é **persistido**: fica na lista de cálculos da organização,
sob a pessoa que emitiu a chave, e pode ser relido por
`GET /v1/calculations/{id}`.

**Cobrança:** cada resposta 201 com chave `jp_live_` é uma chamada
cobrada. Erro não cobra, e chave `jp_test_` nunca cobra.

**Limite:** 60 chamadas por minuto por chave.



**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "clientName": {
      "type": "string",
      "description": "Nome do reclamante. Aparece no cálculo e nos documentos."
    },
    "clientDocument": {
      "description": "CPF do reclamante, com ou sem pontuação.",
      "type": "string"
    },
    "clientId": {
      "description": "Id de um cliente já cadastrado, para vincular o cálculo a ele. Omita para um cálculo solto.",
      "type": "string"
    },
    "observations": {
      "description": "Texto livre guardado junto do cálculo.",
      "type": "string"
    },
    "startDate": {
      "description": "Data de admissão, em ISO 8601 (ex.: 2020-01-10)."
    },
    "endDate": {
      "description": "Data do término do contrato, em ISO 8601. Precisa ser posterior a startDate."
    },
    "lastSalary": {
      "type": "number",
      "description": "Última remuneração mensal, em reais. Base do aviso prévio, do 13º, das férias e do saldo de salário."
    },
    "baseSalary": {
      "type": "number",
      "description": "Salário base contratual, sem adicionais. Base do adicional de periculosidade e do de transferência."
    },
    "unpaid13ths": {
      "type": "number",
      "description": "Quantidade de décimos terceiros em atraso. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: o V3 apura o 13º por avos entre admissão e término."
    },
    "vacationCount": {
      "type": "number",
      "description": "Períodos de férias, no formato antigo da estimativa. Guardado no cálculo, mas **sem efeito no resultado da liquidação**: use vacationVencidasCount para férias vencidas — as proporcionais saem dos avos."
    },
    "vacationVencidasCount": {
      "default": 0,
      "description": "Períodos aquisitivos completos não gozados. Cada um é pago em dobro na rescisão (CLT art. 137), já com o terço constitucional.",
      "type": "number",
      "minimum": 0
    },
    "priorNoticeWorked": {
      "type": "boolean",
      "description": "true quando o aviso prévio foi cumprido trabalhando; false quando é indenizado."
    },
    "priorNoticeDate": {
      "description": "Data da comunicação do aviso prévio, em ISO 8601."
    },
    "extraHours": {
      "type": "number",
      "description": "Total de horas extras do contrato inteiro — não a média mensal. Pagas com adicional de 50%."
    },
    "nightHours": {
      "type": "number",
      "description": "Total de horas noturnas do contrato inteiro — não a média mensal. O adicional vem de nightAdditionalPercent."
    },
    "insalubrityLevel": {
      "anyOf": [
        {
          "type": "number",
          "enum": [
            0
          ]
        },
        {
          "type": "number",
          "enum": [
            10
          ]
        },
        {
          "type": "number",
          "enum": [
            20
          ]
        },
        {
          "type": "number",
          "enum": [
            40
          ]
        }
      ],
      "description": "Grau de insalubridade: 0 (nenhum), 10 (mínimo), 20 (médio) ou 40 (máximo). Incide sobre o salário mínimo, por mês trabalhado (CLT art. 192)."
    },
    "dangerousWork": {
      "type": "boolean",
      "description": "Periculosidade: 30% do salário base por mês trabalhado (CLT art. 193 §1º)."
    },
    "lastThreeSalariesAvg": {
      "type": "number",
      "description": "Média das três últimas remunerações. Usada só para estimar o seguro-desemprego, pelas faixas da Lei 7.998/90."
    },
    "applyArt477Fine": {
      "default": false,
      "description": "Multa do art. 477 §8º da CLT: uma remuneração, quando o pagamento da rescisão atrasa.",
      "type": "boolean"
    },
    "terminationType": {
      "type": "string",
      "enum": [
        "sem_justa_causa",
        "com_justa_causa",
        "pedido_demissao",
        "rescisao_indireta"
      ],
      "description": "Modalidade da rescisão. com_justa_causa zera 13º, férias, aviso e multa de 40%."
    },
    "salaryHistory": {
      "description": "Evolução salarial, mês a mês (YYYY-MM). Sem ela, o FGTS do período é apurado pelo salário informado.",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "month": {
            "type": "string"
          },
          "baseSalary": {
            "type": "number"
          },
          "lastSalary": {
            "type": "number"
          }
        },
        "required": [
          "month",
          "baseSalary",
          "lastSalary"
        ]
      }
    },
    "unpaidSalaries": {
      "description": "Meses com salário em atraso e quantos dias foram trabalhados em cada um. Viram saldo de salário.",
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "month": {
            "type": "string"
          },
          "daysWorked": {
            "type": "integer",
            "minimum": 0,
            "maximum": 30
          }
        },
        "required": [
          "month",
          "daysWorked"
        ]
      }
    },
    "filingDate": {
      "description": "Data do ajuizamento, em ISO 8601. É dela que sai o corte da prescrição quinquenal."
    },
    "liquidationDate": {
      "description": "Data até a qual corrigir e contar juros, em ISO 8601. Ausente significa hoje."
    },
    "nightAdditionalPercent": {
      "default": 20,
      "description": "Percentual do adicional noturno (CLT art. 73 dá 20%). Percentual, não fração: 20 significa 20%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "satRate": {
      "default": 3,
      "description": "Alíquota do RAT/SAT usada nos encargos do empregador. Percentual: 3 significa 3%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "employerInssRate": {
      "default": 20,
      "description": "Alíquota patronal de INSS sobre as verbas salariais. Percentual: 20 significa 20%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "honorariosRate": {
      "default": 15,
      "description": "Percentual de honorários calculado sobre o valor da condenação. Percentual: 15 significa 15%.",
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "irpfDependents": {
      "default": 0,
      "description": "Número de dependentes, para a dedução do IRPF.",
      "type": "integer",
      "minimum": 0,
      "maximum": 9007199254740991
    },
    "applyArt467": {
      "default": false,
      "description": "Art. 467 da CLT: acréscimo de 50% sobre as verbas rescisórias incontroversas não pagas na primeira audiência.",
      "type": "boolean"
    },
    "applyPrescricaoQuinquenal": {
      "default": false,
      "description": "Corta as parcelas anteriores a cinco anos da data de ajuizamento (CF art. 7º, XXIX).",
      "type": "boolean"
    },
    "salaryDifference": {
      "description": "Diferença salarial (equiparação, desvio de função, acúmulo), por períodos, com ou sem reflexos nas demais verbas.",
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "equiparacao",
            "desvio_funcao"
          ]
        },
        "paradigmName": {
          "type": "string",
          "maxLength": 200
        },
        "applyReflexos": {
          "default": true,
          "type": "boolean"
        },
        "periods": {
          "minItems": 1,
          "maxItems": 24,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "startMonth": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}$"
              },
              "endMonth": {
                "type": "string",
                "pattern": "^\\d{4}-\\d{2}$"
              },
              "dueSalary": {
                "type": "number",
                "minimum": 0,
                "exclusiveMinimum": true
              },
              "receivedSalary": {
                "type": "number",
                "minimum": 0
              }
            },
            "required": [
              "startMonth",
              "endMonth",
              "dueSalary"
            ]
          }
        }
      },
      "required": [
        "type",
        "periods"
      ]
    },
    "customVerbas": {
      "description": "Verbas fora da tabela padrão, cada uma com valor mensal, intervalo de meses e natureza (salarial ou indenizatória).",
      "maxItems": 20,
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 120
          },
          "monthlyValue": {
            "type": "number",
            "minimum": 0,
            "exclusiveMinimum": true
          },
          "startMonth": {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}$"
          },
          "endMonth": {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}$"
          },
          "nature": {
            "default": "indenizatoria",
            "type": "string",
            "enum": [
              "indenizatoria",
              "salarial"
            ]
          }
        },
        "required": [
          "name",
          "monthlyValue",
          "startMonth",
          "endMonth"
        ]
      }
    },
    "intervalIntrajornadaHours": {
      "description": "Horas de intervalo suprimidas **por mês** (CLT art. 71 §4º), pagas com adicional de 50%. Diferente de extraHours, que é total do contrato.",
      "type": "number",
      "minimum": 0,
      "maximum": 300
    },
    "transferAdditionalMonths": {
      "description": "Meses em que houve transferência provisória: 25% do salário base em cada (CLT art. 469 §3º).",
      "type": "integer",
      "minimum": 0,
      "maximum": 600
    },
    "applyDsrOnExtra": {
      "description": "Reflexo em DSR sobre horas extras e adicional noturno (Lei 605/49).",
      "type": "boolean"
    },
    "stabilityMonths": {
      "description": "Meses de estabilidade a indenizar: salários do período mais os reflexos de 13º e férias.",
      "type": "integer",
      "minimum": 0,
      "maximum": 600
    },
    "fgtsAlreadyDeposited": {
      "description": "FGTS já depositado, em reais. Abatido do total devido.",
      "type": "number",
      "minimum": 0
    },
    "amountsAlreadyPaid": {
      "description": "Valores já pagos ao reclamante, em reais. Abatidos do total.",
      "type": "number",
      "minimum": 0
    }
  },
  "required": [
    "clientName",
    "startDate",
    "endDate",
    "lastSalary",
    "baseSalary",
    "unpaid13ths",
    "vacationCount",
    "priorNoticeWorked",
    "extraHours",
    "nightHours",
    "insalubrityLevel",
    "dangerousWork",
    "lastThreeSalariesAvg",
    "terminationType"
  ]
}
```

**Responses:**

- **201**: Cálculo criado. Esta é a única resposta que gera cobrança.
- **400**: Corpo inválido: a mensagem diz qual campo. Não é cobrado.
- **401**: Chave ausente, malformada ou revogada. A mensagem é a mesma nos três casos, de propósito.
- **402**: Organização sem assinatura ativa. A API pública é do plano Max.


---
### GET /v1/calculations/{id}

**Summary:** Ler um cálculo


Relê um cálculo da própria organização — o mesmo corpo devolvido na
criação, sem recalcular nada: os valores são os que foram gravados,
com os índices vigentes naquele momento.

Serve para o seu sistema não precisar guardar o resultado inteiro,
só o `id`.

**Cobrança:** leitura não cobra, em nenhum ambiente.

**Limite:** 60 chamadas por minuto por chave.


**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Cálculo encontrado.
- **401**: Chave ausente, malformada ou revogada.
- **402**: Organização sem assinatura ativa.
- **404**: Cálculo inexistente **ou** de outra organização: os dois casos respondem igual, para não confirmar a existência de dado alheio.


---
### POST /api-keys

**Summary:** Create API key




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "maxLength": 80
    },
    "mode": {
      "default": "live",
      "type": "string",
      "enum": [
        "live",
        "test"
      ]
    }
  },
  "required": [
    "name"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /api-keys

**Summary:** List API keys





**Responses:**

- **200**: Default Response


---
### GET /api-keys/usage

**Summary:** Read API usage for the current billing cycle





**Responses:**

- **200**: Default Response


---
### DELETE /api-keys/{id}

**Summary:** Revoke API key



**Parameters:**

- `id` (path) required



**Responses:**

- **204**: Default Response
- **404**: Default Response


---
### GET /cases/{caseId}/messages

**Summary:** List case messages



**Parameters:**

- `cursor` (query) optional
- `limit` (query) optional
- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/messages

**Summary:** Send message to client



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "body": {
      "default": "",
      "type": "string",
      "maxLength": 5000
    },
    "attachmentDocumentIds": {
      "maxItems": 5,
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

**Responses:**

- **201**: Default Response
- **400**: Default Response


---
### POST /cases/{caseId}/messages/read

**Summary:** Mark case messages as read



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### GET /messages/unread-count

**Summary:** Count unread messages





**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/messages/upload-url

**Summary:** Signed URL for message attachment upload



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1,
      "maximum": 26214400
    }
  },
  "required": [
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### POST /cases/{caseId}/messages/attachments

**Summary:** Register uploaded message attachment



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileKey": {
      "type": "string",
      "minLength": 1
    },
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1,
      "maximum": 26214400
    }
  },
  "required": [
    "fileKey",
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **201**: Default Response
- **400**: Default Response


---
### GET /cases/{caseId}/events/stream

**Summary:** Stream case events (SSE)



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### POST /cases/{caseId}/documents/upload-url

**Summary:** Get presigned upload URL for case document



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileName": {
      "type": "string"
    },
    "mimeType": {
      "type": "string"
    },
    "kind": {
      "type": "string",
      "enum": [
        "ctps",
        "holerite",
        "contrato",
        "comprovante",
        "outros"
      ]
    },
    "sizeBytes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 26214400
    }
  },
  "required": [
    "fileName",
    "mimeType",
    "kind",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### POST /cases/{caseId}/documents

**Summary:** Confirm document upload and save metadata



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileKey": {
      "type": "string"
    },
    "fileName": {
      "type": "string"
    },
    "mimeType": {
      "type": "string"
    },
    "sizeBytes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "kind": {
      "type": "string",
      "enum": [
        "ctps",
        "holerite",
        "contrato",
        "comprovante",
        "outros"
      ]
    }
  },
  "required": [
    "fileKey",
    "fileName",
    "mimeType",
    "sizeBytes",
    "kind"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /cases/{caseId}/documents

**Summary:** List documents for a case



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
### DELETE /documents/{documentId}

**Summary:** Soft-delete a document



**Parameters:**

- `documentId` (path) required



**Responses:**

- **204**: Default Response


---
### POST /document-templates

**Summary:** Create a custom document template




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string"
    },
    "type": {
      "default": "customizado",
      "type": "string",
      "enum": [
        "parecer_tecnico",
        "peticao_inicial",
        "proposta_acordo",
        "notificacao_extrajudicial",
        "customizado"
      ]
    }
  },
  "required": [
    "name"
  ]
}
```

**Responses:**

- **201**: Default Response


---
### GET /document-templates

**Summary:** List document templates for the authenticated user



**Parameters:**

- `type` (query) optional



**Responses:**

- **200**: Default Response


---
### GET /document-templates/{id}

**Summary:** Get document template by id



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### PATCH /document-templates/{id}

**Summary:** Update a custom document template



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "description": {
      "type": "string"
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### DELETE /document-templates/{id}

**Summary:** Delete a custom document template



**Parameters:**

- `id` (path) required



**Responses:**

- **204**: Default Response
- **404**: Default Response


---
### POST /document-templates/{id}/upload-url

**Summary:** Get presigned upload URL for template .docx file



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "mimeType": {
      "type": "string",
      "enum": [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ]
    },
    "sizeBytes": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 5242880
    }
  },
  "required": [
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### GET /document-templates/{id}/download

**Summary:** Get download URL for template .docx file



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /document-templates/{id}/duplicate

**Summary:** Duplicate a system template as a custom template for the user



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    }
  }
}
```

**Responses:**

- **201**: Default Response
- **404**: Default Response


---
### POST /document-templates/{id}/validate

**Summary:** Validate placeholders in a template .docx file



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /document-templates/placeholders

**Summary:** List all available template placeholders





**Responses:**

- **200**: Default Response


---
### POST /document-templates/{id}/generate

**Summary:** Generate a document from a template (calculation/case/client)



**Parameters:**

- `id` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "calculationId": {
      "type": "string"
    },
    "caseId": {
      "type": "string"
    },
    "clientId": {
      "type": "string"
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /client-portal/sessions

**Summary:** Client portal sign in




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "mail": {
      "type": "string",
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    },
    "password": {
      "type": "string",
      "minLength": 1
    },
    "organizationId": {
      "type": "string"
    }
  },
  "required": [
    "mail",
    "password"
  ]
}
```

**Responses:**

- **201**: Default Response
- **401**: Default Response


---
### DELETE /client-portal/sessions

**Summary:** Client portal sign out





**Responses:**

- **200**: Default Response


---
### GET /client-portal/check-auth

**Summary:** Check client portal auth





**Responses:**

- **200**: Default Response


---
### POST /client-portal/switch

**Summary:** Switch the active office of a client portal session




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "organizationId": {
      "type": "string"
    }
  },
  "required": [
    "organizationId"
  ]
}
```

**Responses:**

- **201**: Default Response
- **404**: Default Response


---
### PATCH /client-portal/change-password

**Summary:** Client portal change password




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "currentPassword": {
      "type": "string",
      "minLength": 1
    },
    "newPassword": {
      "type": "string",
      "minLength": 8,
      "allOf": [
        {
          "type": "string",
          "pattern": "[A-Z]"
        },
        {
          "type": "string",
          "pattern": "\\d"
        }
      ]
    }
  },
  "required": [
    "currentPassword",
    "newPassword"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### POST /client-portal/forgot-password

**Summary:** Request password reset




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "mail": {
      "type": "string",
      "format": "email",
      "pattern": "^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$"
    }
  },
  "required": [
    "mail"
  ]
}
```

**Responses:**

- **200**: Default Response


---
### POST /client-portal/reset-password

**Summary:** Reset password with token




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "token": {
      "type": "string",
      "minLength": 1
    },
    "newPassword": {
      "type": "string",
      "minLength": 8,
      "allOf": [
        {
          "type": "string",
          "pattern": "[A-Z]"
        },
        {
          "type": "string",
          "pattern": "\\d"
        }
      ]
    }
  },
  "required": [
    "token",
    "newPassword"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### GET /client-portal/invites/{token}

**Summary:** Check a portal first-access link



**Parameters:**

- `token` (path) required



**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### POST /client-portal/invites/accept

**Summary:** Set the portal password from a first-access link




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "token": {
      "type": "string",
      "minLength": 1
    },
    "password": {
      "type": "string",
      "minLength": 8,
      "allOf": [
        {
          "type": "string",
          "pattern": "[A-Z]"
        },
        {
          "type": "string",
          "pattern": "\\d"
        }
      ]
    }
  },
  "required": [
    "token",
    "password"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response


---
### POST /client-portal/invites/link

**Summary:** Activate a first-access link with an existing portal password




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "token": {
      "type": "string",
      "minLength": 1
    },
    "password": {
      "type": "string",
      "minLength": 1
    }
  },
  "required": [
    "token",
    "password"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **401**: Default Response


---
### GET /client-portal/dashboard

**Summary:** Get client dashboard data





**Responses:**

- **200**: Default Response


---
### GET /client-portal/cases

**Summary:** List the client's cases





**Responses:**

- **200**: Default Response


---
### GET /client-portal/cases/{caseId}

**Summary:** Get case details for client



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /client-portal/cases/{caseId}/timeline

**Summary:** Get case timeline for client



**Parameters:**

- `type` (query) optional
- `limit` (query) optional
- `offset` (query) optional
- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /client-portal/cases/{caseId}/documents

**Summary:** Get document requirements for case



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /client-portal/documents/upload-url

**Summary:** Generate signed URL for document upload




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "requirementId": {
      "type": "string",
      "format": "cuid",
      "pattern": "^[cC][0-9a-z]{6,}$"
    },
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1,
      "maximum": 26214400
    }
  },
  "required": [
    "requirementId",
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /client-portal/documents

**Summary:** Confirm document upload




**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "requirementId": {
      "type": "string",
      "format": "cuid",
      "pattern": "^[cC][0-9a-z]{6,}$"
    },
    "fileKey": {
      "type": "string",
      "minLength": 1
    },
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1
    }
  },
  "required": [
    "requirementId",
    "fileKey",
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **201**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### GET /client-portal/documents/{documentId}/download-url

**Summary:** Generate signed URL for document download



**Parameters:**

- `documentId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /client-portal/notifications

**Summary:** Get client notifications



**Parameters:**

- `limit` (query) optional
- `offset` (query) optional
- `unreadOnly` (query) optional



**Responses:**

- **200**: Default Response


---
### PATCH /client-portal/notifications/{notificationId}/read

**Summary:** Mark notification as read



**Parameters:**

- `notificationId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### PATCH /client-portal/notifications/read-all

**Summary:** Mark all notifications as read





**Responses:**

- **200**: Default Response


---
### GET /client-portal/cases/{caseId}/settlements

**Summary:** Get settlements for case



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /client-portal/settlements/{settlementId}/accept

**Summary:** Accept settlement proposal



**Parameters:**

- `settlementId` (path) required



**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /client-portal/settlements/{settlementId}/reject

**Summary:** Reject settlement proposal



**Parameters:**

- `settlementId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "reason": {
      "type": "string"
    }
  }
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### GET /client-portal/calculations

**Summary:** List client calculations



**Parameters:**

- `limit` (query) optional
- `cursor` (query) optional



**Responses:**

- **200**: Default Response


---
### GET /client-portal/calculations/{id}

**Summary:** Get client calculation by id



**Parameters:**

- `id` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /client-portal/cases/{caseId}/hearings

**Summary:** Get case hearings for client



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /client-portal/cases/{caseId}/deadlines

**Summary:** Get case deadlines for client



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /client-portal/cases/{caseId}/messages

**Summary:** List case messages as client



**Parameters:**

- `cursor` (query) optional
- `limit` (query) optional
- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### POST /client-portal/cases/{caseId}/messages

**Summary:** Send message to the office



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "body": {
      "default": "",
      "type": "string",
      "maxLength": 5000
    },
    "attachmentDocumentIds": {
      "maxItems": 5,
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  }
}
```

**Responses:**

- **201**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /client-portal/cases/{caseId}/messages/read

**Summary:** Mark case messages as read (client)



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response
- **404**: Default Response


---
### GET /client-portal/messages/unread-count

**Summary:** Count unread messages (client)





**Responses:**

- **200**: Default Response


---
### POST /client-portal/cases/{caseId}/messages/upload-url

**Summary:** Signed URL for message attachment upload (client)



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1,
      "maximum": 26214400
    }
  },
  "required": [
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **200**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### POST /client-portal/cases/{caseId}/messages/attachments

**Summary:** Register uploaded message attachment (client)



**Parameters:**

- `caseId` (path) required


**Request Body:**

```json
{
  "type": "object",
  "properties": {
    "fileKey": {
      "type": "string",
      "minLength": 1
    },
    "fileName": {
      "type": "string",
      "minLength": 1,
      "maxLength": 255
    },
    "mimeType": {
      "type": "string",
      "minLength": 1
    },
    "sizeBytes": {
      "type": "number",
      "minimum": 1,
      "maximum": 26214400
    }
  },
  "required": [
    "fileKey",
    "fileName",
    "mimeType",
    "sizeBytes"
  ]
}
```

**Responses:**

- **201**: Default Response
- **400**: Default Response
- **404**: Default Response


---
### GET /client-portal/cases/{caseId}/events/stream

**Summary:** Stream case events as client (SSE)



**Parameters:**

- `caseId` (path) required



**Responses:**

- **200**: Default Response


---
