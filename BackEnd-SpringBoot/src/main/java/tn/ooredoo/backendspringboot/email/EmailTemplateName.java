package tn.ooredoo.backendspringboot.email;

import lombok.Getter;

@Getter
public enum EmailTemplateName {
    ACTIVATE_ACCOUNT("activate_account"),
    INVITATION_EMAIL("invitation-email");

    private final String name;

    EmailTemplateName(String name) {
        this.name = name;
    }
}