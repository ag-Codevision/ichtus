import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CustomerType, PersonType, CustomerStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/crm/contacts/[id]
 * Ficha 360º de Contato (Cliente, Fornecedor ou Prestador) com histórico completo
 */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const contact = await prisma.customer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            isActive: true,
          },
        },
        serviceOrders: {
          orderBy: { createdAt: "desc" },
          take: 15,
          select: {
            id: true,
            code: true,
            title: true,
            currentStage: true,
            priority: true,
            totalAmount: true,
            deadline: true,
            createdAt: true,
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 15,
          select: {
            id: true,
            code: true,
            amount: true,
            dueDate: true,
            paidDate: true,
            status: true,
            paymentMethod: true,
          },
        },
        leads: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            estimatedValue: true,
            priority: true,
            createdAt: true,
            column: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
        appointments: {
          orderBy: { scheduledAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
            scheduledAt: true,
            durationMinutes: true,
            locationAddress: true,
            assignedTeam: true,
          },
        },
        stockItems: {
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            unit: true,
            currentQuantity: true,
            minQuantity: true,
            averageUnitCost: true,
          },
        },
        financialTransactions: {
          orderBy: { entryDate: "desc" },
          take: 15,
          select: {
            id: true,
            type: true,
            category: true,
            description: true,
            amount: true,
            entryDate: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contato não encontrado." },
        { status: 404 }
      );
    }

    // Calcula KPIs financeiros da entidade
    const totalInvoiced = contact.invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPaid = contact.invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((acc, inv) => acc + Number(inv.amount), 0);
    const totalPending = totalInvoiced - totalPaid;

    return NextResponse.json({
      success: true,
      contact: {
        ...contact,
        kpis: {
          totalInvoiced,
          totalPaid,
          totalPending,
          totalOS: contact.serviceOrders.length,
          totalLeads: contact.leads.length,
          totalStockSupplied: contact.stockItems.length,
        },
      },
    });
  } catch (error: any) {
    console.error("Erro ao carregar detalhes do contato:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar detalhes do contato." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/crm/contacts/[id]
 * Atualização completa de dados cadastrais
 */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Contato não localizado para atualização." },
        { status: 404 }
      );
    }

    const {
      type,
      personType,
      status,
      companyName,
      tradeName,
      fullName,
      documentNumber,
      stateRegistration,
      municipalRegistration,
      rg,
      contactPerson,
      contactRole,
      contactPersonPhone,
      contactPersonEmail,
      contactPersonNotes,
      leadChannel,
      leadChannelDetails,
      phone,
      whatsapp,
      email,
      financialEmail,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      referencePoint,
      creditLimit,
      paymentTerms,
      pixKeyType,
      pixKey,
      bankName,
      bankAgency,
      bankAccount,
      notes,
      tags,
    } = body;

    // 1. Validação de Unicidade de Documento (CPF / CNPJ) na Edição
    if (documentNumber !== undefined && documentNumber !== null && documentNumber !== "") {
      const cleanedDoc = documentNumber.replace(/\D/g, "");
      if (cleanedDoc && cleanedDoc.length >= 8) {
        const existingDoc = await prisma.customer.findFirst({
          where: {
            id: { not: id },
            OR: [
              { documentNumber: { equals: documentNumber.trim(), mode: "insensitive" } },
              { documentNumber: { equals: cleanedDoc } },
              { documentNumber: { contains: cleanedDoc } },
            ],
          },
        });

        if (existingDoc) {
          const contactName = existingDoc.tradeName || existingDoc.fullName || existingDoc.companyName || "Outro Cadastro";
          const docLabel = (personType || existing.personType) === "PJ" ? "CNPJ" : "CPF";
          return NextResponse.json(
            {
              success: false,
              error: `Não foi possível atualizar: O ${docLabel} informado (${documentNumber}) já está cadastrado para o contato "${contactName}".`,
            },
            { status: 409 }
          );
        }
      }
    }

    // 2. Validação de Unicidade de E-mail na Edição
    const candidateEmail = email !== undefined ? (email ? email.trim().toLowerCase() : null) : existing.email;
    if (candidateEmail) {
      const existingEmail = await prisma.customer.findFirst({
        where: {
          id: { not: id },
          email: { equals: candidateEmail, mode: "insensitive" },
        },
      });

      if (existingEmail) {
        const contactName = existingEmail.tradeName || existingEmail.fullName || existingEmail.companyName || "Outro Cadastro";
        return NextResponse.json(
          {
            success: false,
            error: `Não foi possível atualizar: O e-mail informado (${candidateEmail}) já está cadastrado para o contato "${contactName}".`,
          },
          { status: 409 }
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: candidateEmail },
        include: { customerProfile: true },
      });

      if (
        existingUser &&
        existingUser.id !== existing.userId &&
        existingUser.customerProfile &&
        existingUser.customerProfile.id !== id
      ) {
        const contactName =
          existingUser.customerProfile.tradeName ||
          existingUser.customerProfile.fullName ||
          existingUser.customerProfile.companyName ||
          existingUser.name;
        return NextResponse.json(
          {
            success: false,
            error: `Não foi possível atualizar: O e-mail (${candidateEmail}) já está vinculado ao usuário do cliente "${contactName}".`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Validação de Unicidade de Telefone / WhatsApp na Edição
    const candidatePhone = phone !== undefined ? phone?.trim() : existing.phone;
    const candidateWpp = whatsapp !== undefined ? whatsapp?.trim() : existing.whatsapp;
    const cleanedPhone = candidatePhone?.replace(/\D/g, "");
    const cleanedWpp = candidateWpp?.replace(/\D/g, "");

    const phoneValuesToCheck: string[] = [];
    if (cleanedWpp && cleanedWpp.length >= 8) {
      phoneValuesToCheck.push(cleanedWpp);
      if (cleanedWpp.startsWith("55") && cleanedWpp.length >= 12) {
        phoneValuesToCheck.push(cleanedWpp.slice(2));
      }
      if (candidateWpp) phoneValuesToCheck.push(candidateWpp);
    }
    if (cleanedPhone && cleanedPhone.length >= 8) {
      phoneValuesToCheck.push(cleanedPhone);
      if (candidatePhone) phoneValuesToCheck.push(candidatePhone);
    }

    if (phoneValuesToCheck.length > 0) {
      const existingPhone = await prisma.customer.findFirst({
        where: {
          id: { not: id },
          OR: [
            { whatsapp: { in: phoneValuesToCheck } },
            { phone: { in: phoneValuesToCheck } },
            { contactPersonPhone: { in: phoneValuesToCheck } },
          ],
        },
      });

      if (existingPhone) {
        const contactName = existingPhone.tradeName || existingPhone.fullName || existingPhone.companyName || "Outro Cadastro";
        const duplicateDisplay = candidateWpp || candidatePhone;
        return NextResponse.json(
          {
            success: false,
            error: `Não foi possível atualizar: O telefone/WhatsApp (${duplicateDisplay}) já está cadastrado para o contato "${contactName}".`,
          },
          { status: 409 }
        );
      }
    }

    const effectiveEmail = email !== undefined ? (email ? email.trim().toLowerCase() : null) : existing.email;
    const effectiveName = (tradeName || fullName || companyName || contactPerson || existing.tradeName || existing.fullName || existing.companyName || "Cliente").trim();
    const effectivePhone = whatsapp || phone || existing.whatsapp || existing.phone || null;

    let targetUserId = existing.userId;

    if (effectiveEmail) {
      if (existing.userId) {
        // Atualiza dados no User vinculado
        await prisma.user.update({
          where: { id: existing.userId },
          data: {
            email: effectiveEmail,
            name: effectiveName,
            phone: effectivePhone,
          },
        }).catch((err) => console.warn("Aviso ao atualizar user vinculado:", err));
      } else {
        // Procura ou cria o User com senha padrão Icthus@123
        let user = await prisma.user.findUnique({ where: { email: effectiveEmail } });
        if (!user) {
          const defaultHash = await bcrypt.hash("Icthus@123", 10);
          user = await prisma.user.create({
            data: {
              name: effectiveName,
              email: effectiveEmail,
              passwordHash: defaultHash,
              phone: effectivePhone,
              role: "CUSTOMER",
              isActive: false,
            },
          });
        }
        targetUserId = user.id;
      }
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        userId: targetUserId,
        type: type ? (type as CustomerType) : undefined,
        personType: personType ? (personType as PersonType) : undefined,
        status: status ? (status as CustomerStatus) : undefined,
        companyName: companyName !== undefined ? companyName?.trim() || null : undefined,
        tradeName: tradeName !== undefined ? tradeName?.trim() || null : undefined,
        fullName: fullName !== undefined ? fullName?.trim() || null : undefined,
        documentNumber: documentNumber !== undefined ? documentNumber?.trim() || null : undefined,
        stateRegistration: stateRegistration !== undefined ? stateRegistration?.trim() || null : undefined,
        municipalRegistration: municipalRegistration !== undefined ? municipalRegistration?.trim() || null : undefined,
        rg: rg !== undefined ? rg?.trim() || null : undefined,
        contactPerson: contactPerson !== undefined ? contactPerson?.trim() || null : undefined,
        contactRole: contactRole !== undefined ? contactRole?.trim() || null : undefined,
        contactPersonPhone: contactPersonPhone !== undefined ? contactPersonPhone?.trim() || null : undefined,
        contactPersonEmail: contactPersonEmail !== undefined ? contactPersonEmail?.trim()?.toLowerCase() || null : undefined,
        contactPersonNotes: contactPersonNotes !== undefined ? contactPersonNotes?.trim() || null : undefined,
        leadChannel: leadChannel !== undefined ? leadChannel?.trim() || null : undefined,
        leadChannelDetails: leadChannelDetails !== undefined ? leadChannelDetails?.trim() || null : undefined,
        phone: phone !== undefined ? phone?.trim() || null : undefined,
        whatsapp: whatsapp !== undefined ? whatsapp?.trim() || null : undefined,
        email: email !== undefined ? email?.trim()?.toLowerCase() || null : undefined,
        financialEmail: financialEmail !== undefined ? financialEmail?.trim()?.toLowerCase() || null : undefined,
        zipCode: zipCode !== undefined ? zipCode?.trim() || null : undefined,
        street: street !== undefined ? street?.trim() || null : undefined,
        number: number !== undefined ? number?.trim() || null : undefined,
        complement: complement !== undefined ? complement?.trim() || null : undefined,
        neighborhood: neighborhood !== undefined ? neighborhood?.trim() || null : undefined,
        city: city !== undefined ? city?.trim() || null : undefined,
        state: state !== undefined ? state?.trim()?.toUpperCase() || null : undefined,
        referencePoint: referencePoint !== undefined ? referencePoint?.trim() || null : undefined,
        creditLimit: creditLimit !== undefined ? (creditLimit ? parseFloat(creditLimit) : null) : undefined,
        paymentTerms: paymentTerms !== undefined ? paymentTerms?.trim() || null : undefined,
        pixKeyType: pixKeyType !== undefined ? pixKeyType || null : undefined,
        pixKey: pixKey !== undefined ? pixKey?.trim() || null : undefined,
        bankName: bankName !== undefined ? bankName?.trim() || null : undefined,
        bankAgency: bankAgency !== undefined ? bankAgency?.trim() || null : undefined,
        bankAccount: bankAccount !== undefined ? bankAccount?.trim() || null : undefined,
        notes: notes !== undefined ? notes?.trim() || null : undefined,
        tags: Array.isArray(tags) ? tags : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      contact: updated,
      message: "Dados do contato atualizados com sucesso!",
    });
  } catch (error: any) {
    console.error("Erro ao atualizar contato:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Falha ao salvar alterações do contato." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/crm/contacts/[id]
 * Desativação ou exclusão lógica do contato
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const contact = await prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            serviceOrders: true,
            invoices: true,
            leads: true,
            assistedLeads: true,
            stockItems: true,
            appointments: true,
            financialTransactions: true,
          },
        },
      },
    });

    if (!contact) {
      return NextResponse.json(
        { success: false, error: "Contato não localizado." },
        { status: 404 }
      );
    }

    const hasFiscalOrOrderRecords =
      contact._count.serviceOrders > 0 || contact._count.invoices > 0;

    // Se possui ordens de serviço ou faturas registradas (vínculos legais obrigatórios), arquiva com segurança
    if (hasFiscalOrOrderRecords) {
      await prisma.customer.update({
        where: { id },
        data: { status: CustomerStatus.INACTIVE },
      });

      if (contact.userId) {
        await prisma.user
          .update({
            where: { id: contact.userId },
            data: { isActive: false },
          })
          .catch(() => {});
      }

      return NextResponse.json({
        success: true,
        action: "archived",
        message:
          "O contato possui ordens de serviço ou faturas registradas e foi arquivado com segurança.",
      });
    }

    // Se não possui faturas ou ordens de serviço, desvincula referências opcionais e realiza exclusão permanente
    await prisma.$transaction(async (tx) => {
      if (contact._count.leads > 0) {
        await tx.lead.updateMany({
          where: { customerId: id },
          data: { customerId: null },
        });
      }
      if (contact._count.assistedLeads > 0) {
        await tx.lead.updateMany({
          where: { helperId: id },
          data: { helperId: null },
        });
      }
      if (contact._count.appointments > 0) {
        await tx.appointment.updateMany({
          where: { customerId: id },
          data: { customerId: null },
        });
      }
      if (contact._count.financialTransactions > 0) {
        await tx.financialTransaction.updateMany({
          where: { customerId: id },
          data: { customerId: null },
        });
      }
      if (contact._count.stockItems > 0) {
        await tx.stockItem.updateMany({
          where: { supplierId: id },
          data: { supplierId: null },
        });
      }
      await tx.customer.delete({
        where: { id },
      });
    });

    if (contact.userId) {
      const user = await prisma.user.findUnique({ where: { id: contact.userId } });
      if (user && user.role === "CUSTOMER") {
        await prisma.user.delete({ where: { id: contact.userId } }).catch(() => {});
      } else if (user) {
        await prisma.user
          .update({ where: { id: contact.userId }, data: { isActive: false } })
          .catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      action: "deleted",
      message: "Contato removido com sucesso.",
    });
  } catch (error) {
    console.error("Erro na exclusão do contato, executando fallback de arquivamento seguro:", error);
    try {
      await prisma.customer.update({
        where: { id },
        data: { status: CustomerStatus.INACTIVE },
      });
      return NextResponse.json({
        success: true,
        action: "archived",
        message: "Contato arquivado e inativado com segurança no sistema.",
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { success: false, error: "Falha ao remover ou arquivar o contato." },
        { status: 500 }
      );
    }
  }
}
